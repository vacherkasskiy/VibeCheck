import http from './http';
import type { AxiosRequestConfig } from 'axios';
import type { SWRConfiguration } from 'swr';


export const swrFetcher = async <T>(
  url: string,
  params?: AxiosRequestConfig['params'],
): Promise<T> => {
  const response = await http.get<T>(url, params);
  return response.data;
};

export const baseSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  shouldRetryOnError: false,
};
