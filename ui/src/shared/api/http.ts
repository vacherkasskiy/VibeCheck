import axios from 'axios';

import {
  EHttpMethod,
  ApiError
} from './types';
import type {
  IAxios,
  TRequestConfig 
,
  ProblemDetails } from './types';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from 'axios';

export const DEFAULT_TIMEOUT = 60000;
const SERVER_ERROR_DISPLAY_DELAY_MS = 1500;

let accessTokenProvider: (() => string | null | undefined) | null = null;
let authTokensHandler:
  | ((tokens: { accessToken: string | null; refreshToken: string | null }) => void)
  | null = null;
let unauthorizedHandler: ((message: string) => void) | null = null;

export const setAccessTokenProvider = (
  provider: (() => string | null | undefined) | null,
): void => {
  accessTokenProvider = provider;
};

export const setAuthTokensHandler = (
  handler: ((tokens: { accessToken: string | null; refreshToken: string | null }) => void) | null,
): void => {
  authTokensHandler = handler;
};

export const setUnauthorizedHandler = (
  handler: ((message: string) => void) | null,
): void => {
  unauthorizedHandler = handler;
};

const buildApiUrl = (path: string): string => {
  const baseUrl = __API_URL__ || '/';
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};

const NO_AUTH_HEADER_ROUTE_RE =
  /(auth\/email\/login|auth\/email\/register(?:\/confirm)?|auth\/email\/password\/reset|auth\/refresh|auth\/internal(?:\/login)?)/;
const NO_REFRESH_RETRY_ROUTE_RE =
  /(auth\/email\/login|auth\/email\/register(?:\/confirm)?|auth\/email\/password\/reset|auth\/refresh|auth\/logout|auth\/internal(?:\/login)?)/;
const AUTH_REQUIRED_MESSAGE = 'Необходимо авторизоваться, чтобы продолжить.';
const SESSION_EXPIRED_MESSAGE = 'Сессия истекла. Войдите снова.';

const syncTokens = (accessToken: string, refreshToken?: string | null) => {
  localStorage.setItem('accessToken', accessToken);

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  authTokensHandler?.({
    accessToken,
    refreshToken: refreshToken ?? localStorage.getItem('refreshToken'),
  });
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  authTokensHandler?.({ accessToken: null, refreshToken: null });
};

const notifyUnauthorized = (message: string) => {
  unauthorizedHandler?.(message);
};

const delay = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

class Http implements IAxios {
  private static isRefreshing = false;
  private static refreshPromise: Promise<any> | null = null;
  private readonly http: AxiosInstance;

  private readonly requests: Record<string, CancelTokenSource>;

  constructor(
    baseURL: string = '/',
    headers?: AxiosRequestConfig['headers'],
    paramsSerializer?: AxiosRequestConfig['paramsSerializer'],
  ) {
    this.http = axios.create({
      baseURL,
      paramsSerializer,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    this.requests = {};

    this.http.interceptors.request.use(
      (config) => {
        const token = accessTokenProvider ? accessTokenProvider() : localStorage.getItem('accessToken');
        if (token && !config.url?.match(NO_AUTH_HEADER_ROUTE_RE)) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    this.http.interceptors.response.use(
      (response) => response,
      async (error): Promise<AxiosResponse | never> => {
        const { response } = error;
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (response?.status === 401 && !originalRequest._retry) {
          if (originalRequest.url?.match(NO_REFRESH_RETRY_ROUTE_RE)) {
            throw error;
          }

          originalRequest._retry = true;

          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            clearTokens();
            notifyUnauthorized(AUTH_REQUIRED_MESSAGE);
            throw new ApiError(AUTH_REQUIRED_MESSAGE, 401);
          }

          if (Http.isRefreshing) {
            try {
              const refreshedData = await Http.refreshPromise!;
              (originalRequest.headers as any).Authorization = `Bearer ${refreshedData.accessToken}`;
              return this.http(originalRequest);
            } catch {
              clearTokens();
              notifyUnauthorized(SESSION_EXPIRED_MESSAGE);
              throw new ApiError(SESSION_EXPIRED_MESSAGE, 401);
            }
          }

          Http.isRefreshing = true;
          Http.refreshPromise = axios
            .post(buildApiUrl('/auth/refresh'), { refreshToken })
            .then(({ data }) => {
              if (data.accessToken) {
                syncTokens(data.accessToken, data.refreshToken);
                return data;
              }
              throw new Error('Invalid refresh');
            });

          let refreshedData;
          try {
            refreshedData = await Http.refreshPromise;
          } catch {
            clearTokens();
            notifyUnauthorized(SESSION_EXPIRED_MESSAGE);
            throw new ApiError(SESSION_EXPIRED_MESSAGE, 401);
          } finally {
            Http.isRefreshing = false;
            Http.refreshPromise = null;
          }

          (originalRequest.headers as any).Authorization = `Bearer ${refreshedData.accessToken}`;
          return this.http(originalRequest);
        }

        if (response?.status && response.status >= 400 && response.status < 600) {
          const problems: ProblemDetails = response.data || {};
          const status = response.status;
          let message = `HTTP ${status}`;

          if (problems.detail) message = problems.detail;
          else if (problems.title) message = problems.title;
          else if (status === 403) message = 'Доступ запрещён';
          else if (status === 404) message = 'Ресурс не найден';
          else if (status === 400) message = 'Некорректные данные';
          else if (status === 500) {
            message = 'Что-то пошло не так. Попробуйте еще раз позже.';
            console.error('API 500 Error:', response.config?.url, problems);
          }

          if (status >= 500) {
            await delay(SERVER_ERROR_DISPLAY_DELAY_MS);
          }

          throw new ApiError(message, status, problems);
        }

        if (error.code === 'ECONNABORTED') {
          await delay(SERVER_ERROR_DISPLAY_DELAY_MS);
          throw new ApiError('Что-то пошло не так. Попробуйте еще раз позже.', 408);
        }
        if (!response) {
          await delay(SERVER_ERROR_DISPLAY_DELAY_MS);
          throw new ApiError('Что-то пошло не так. Попробуйте еще раз позже.', 0);
        }

        throw error;
      },
    );
  }

  private async request<T>(requestConfig: TRequestConfig): Promise<AxiosResponse<T>> {
    const {
      method,
      url,
      params,
      data,
      config = {},
      abort = false,
      cancelToken,
    } = requestConfig;

    if (abort) {
      this.abortRequest(url);
    }

    const request: AxiosRequestConfig = {
      method,
      url,
      ...config,
      ...(params ? { params } : {}),
      ...(data ? { data } : {}),
      ...(abort ? { cancelToken: this.createAbortController(url).token } : {}),
      ...(cancelToken ? { cancelToken: cancelToken.token } : {}),
    };

    const response = await this.http.request<T>(request);

    this.deleteRequest(url);

    return response;
  }

  private createAbortController(key: string): CancelTokenSource {
    const controller = axios.CancelToken.source();
    this.requests[key] = controller;

    return controller;
  }

  private abortRequest(key: string): void {
    const controller = this.requests[key];

    if (!controller) {
      return;
    }

    controller.cancel();
  }

  private deleteRequest(key: string): void {
    delete this.requests[key];
  }

  public get<T>(
    url: string,
    params?: AxiosRequestConfig['params'],
    options: { config?: AxiosRequestConfig; abort?: boolean; cancelToken?: CancelTokenSource } = {},
  ): Promise<AxiosResponse<T>> {
    const { config, abort, cancelToken } = options;

    return this.request<T>({
      method: EHttpMethod.GET,
      url,
      params,
      config,
      abort,
      cancelToken,
    });
  }

  public post<T>(
    url: string,
    data?: AxiosRequestConfig['data'],
    options: { config?: AxiosRequestConfig; abort?: boolean; cancelToken?: CancelTokenSource } = {},
  ): Promise<AxiosResponse<T>> {
    const { config, abort, cancelToken } = options;

    return this.request<T>({
      method: EHttpMethod.POST,
      url,
      data,
      config,
      abort,
      cancelToken,
    });
  }

  public put<T>(
    url: string,
    data?: AxiosRequestConfig['data'],
    options: { config?: AxiosRequestConfig; abort?: boolean; cancelToken?: CancelTokenSource } = {},
  ): Promise<AxiosResponse<T>> {
    const { config, abort, cancelToken } = options;

    return this.request<T>({
      method: EHttpMethod.PUT,
      url,
      data,
      config,
      abort,
      cancelToken,
    });
  }

  public patch<T>(
    url: string,
    data?: AxiosRequestConfig['data'],
    options: { config?: AxiosRequestConfig; abort?: boolean; cancelToken?: CancelTokenSource } = {},
  ): Promise<AxiosResponse<T>> {
    const { config, abort, cancelToken } = options;

    return this.request<T>({
      method: EHttpMethod.PATCH,
      url,
      data,
      config,
      abort,
      cancelToken,
    });
  }

  public delete<T>(
    url: string,
    options: { config?: AxiosRequestConfig; abort?: boolean; cancelToken?: CancelTokenSource } = {},
  ): Promise<AxiosResponse<T>> {
    const { config, abort, cancelToken } = options;

    return this.request<T>({
      method: EHttpMethod.DELETE,
      url,
      config,
      abort,
      cancelToken,
    });
  }
}

const http = new Http(__API_URL__ || '/api');

export { Http };

export default http;
