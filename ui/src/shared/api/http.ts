import axios from 'axios';

import {
  EHttpMethod,
  ApiError,
  ProblemDetails,
} from './types';
import type {
  IAxios,
  TRequestConfig 
} from './types';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from 'axios';

export const DEFAULT_TIMEOUT = 60000;

let accessTokenProvider: (() => string | null | undefined) | null = null;

export const setAccessTokenProvider = (
  provider: (() => string | null | undefined) | null,
): void => {
  accessTokenProvider = provider;
};

const buildApiUrl = (path: string): string => {
  const baseUrl = __API_URL__ || '/';
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};

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
        if (token && !config.url?.match(/(auth\/email\/login|auth\/email\/register|auth\/email\/register\/confirm|auth\/refresh|avatars)/)) {
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

        // 401 auto-refresh (сохранена логика)
        if (response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new ApiError('Токен авторизации истёк. Обновите страницу.', 401);
          }

          if (Http.isRefreshing) {
            const refreshedData = await Http.refreshPromise!;
            localStorage.setItem('accessToken', refreshedData.accessToken);
            if (refreshedData.refreshToken) localStorage.setItem('refreshToken', refreshedData.refreshToken);
            (originalRequest.headers as any).Authorization = `Bearer ${refreshedData.accessToken}`;
            return this.http(originalRequest);
          }

          Http.isRefreshing = true;
          Http.refreshPromise = axios.post(buildApiUrl('/auth/refresh'), { refreshToken }).then(({ data }) => {
            if (data.accessToken) {
              localStorage.setItem('accessToken', data.accessToken);
              if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
              return data;
            }
            throw new Error('Invalid refresh');
          });

          const refreshedData = await Http.refreshPromise;
          Http.isRefreshing = false;
          Http.refreshPromise = null;
          (originalRequest.headers as any).Authorization = `Bearer ${refreshedData.accessToken}`;
          return this.http(originalRequest);
        }

        // ProblemDetails + ApiError для 400-599
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
            message = 'Серверная ошибка';
            console.error('API 500 Error:', response.config?.url, problems);
          }

          throw new ApiError(message, status, problems);
        }

        // Network/timeout
        if (error.code === 'ECONNABORTED') throw new ApiError('Превышен таймаут запроса', 408);
        if (!response) throw new ApiError('Ошибка сети. Проверьте соединение.', 0);

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
