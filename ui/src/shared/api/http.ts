import axios from 'axios';

import {
  EHttpMethod
} from './types';
import type {
  IAxios,
  TRequestConfig } from './types';
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
        if (token && !config.url?.match(/(auth\/email\/login|auth\/email\/register|auth\/email\/register\/confirm|auth\/refresh|auth\/logout|avatars)/)) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    this.http.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            return Promise.reject(error);
          }

          try {
            const refreshResponse = await axios.post(buildApiUrl('/auth/refresh'), { refreshToken });
            if (refreshResponse.data && refreshResponse.data.accessToken) {
              localStorage.setItem('accessToken', refreshResponse.data.accessToken);
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
              return this.http(originalRequest);
            }
          } catch (refreshError) {
            // Auto-redirect removed to prevent login loop; let components handle unauth state
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
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
