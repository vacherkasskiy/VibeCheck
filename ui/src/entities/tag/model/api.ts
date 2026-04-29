import http from 'shared/api/http';
import useSWR from 'swr';
import { ALL_TAGS } from './mock';
import { FLAG_CATEGORY_LABELS } from './types';
import type { FlagCategoryDtoEnum, Tag } from './types';

interface GetAllFlagsResponse {
  flags: Array<{
    id: string;
    name: string | null;
    category: FlagCategoryDtoEnum;
    description: string | null;
  }> | null;
}

const flagsFetcher = async (path: string) => {
  const response = await http.get<GetAllFlagsResponse>(path);
  return response.data;
};

export const useGetAllFlags = () => {
  const { data, error, isLoading, mutate } = useSWR<GetAllFlagsResponse>('/api/flags', flagsFetcher);

  const apiFlags = data?.flags ?? [];
  const flags: Tag[] = error ? ALL_TAGS : apiFlags.map(f => ({
    id: f.id,
    name: f.name ?? '',
    description: f.description ?? '',
    category: FLAG_CATEGORY_LABELS[f.category] ?? 'Культура',
  })); 

  return {
    flags,
    isLoading: isLoading || !data && !error,
    error,
    mutate,
  };
};
