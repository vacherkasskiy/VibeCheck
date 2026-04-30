import type {
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from 'axios';

export enum EHttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export interface TRequestConfig {
  method: EHttpMethod;
  url: string;
  params?: AxiosRequestConfig['params'];
  data?: AxiosRequestConfig['data'];
  config?: AxiosRequestConfig;
  abort?: boolean;
  cancelToken?: CancelTokenSource;
}

export interface IAxios {
  get<T>(
    url: string,
    params?: AxiosRequestConfig['params'],
    options?: {
      config?: AxiosRequestConfig;
      abort?: boolean;
      cancelToken?: CancelTokenSource;
    },
  ): Promise<AxiosResponse<T>>;

  post<T>(
    url: string,
    data?: AxiosRequestConfig['data'],
    options?: {
      config?: AxiosRequestConfig;
      abort?: boolean;
      cancelToken?: CancelTokenSource;
    },
  ): Promise<AxiosResponse<T>>;

  put<T>(
    url: string,
    data?: AxiosRequestConfig['data'],
    options?: {
      config?: AxiosRequestConfig;
      abort?: boolean;
      cancelToken?: CancelTokenSource;
    },
  ): Promise<AxiosResponse<T>>;

  patch<T>(
    url: string,
    data?: AxiosRequestConfig['data'],
    options?: {
      config?: AxiosRequestConfig;
      abort?: boolean;
      cancelToken?: CancelTokenSource;
    },
  ): Promise<AxiosResponse<T>>;

  delete<T>(
    url: string,
    options?: {
      config?: AxiosRequestConfig;
      abort?: boolean;
      cancelToken?: CancelTokenSource;
    },
  ): Promise<AxiosResponse<T>>;
}

/**
 * RFC7807 ProblemDetails для API ошибок ReviewService.Gateway
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}

/**
 * Типизированная ApiError для всех запросов
 */
export class ApiError extends Error {
  public status?: number;
  public problems?: ProblemDetails;

  constructor(
    message: string,
    status?: number,
    problems?: ProblemDetails,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problems = problems;
  }
}

