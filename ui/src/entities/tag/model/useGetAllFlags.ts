import http from 'shared/api/http';
import { useMemo } from 'react';
import useSWR from 'swr';
import { ALL_TAGS } from './mock';
import { FLAG_CATEGORY_LABELS } from './types';
import type { FlagCategoryDtoEnum, Tag } from './types';

interface GetAllFlagsItemDto {
  id: string;
  name: string | null;
  category: FlagCategoryDtoEnum;
  description: string | null;
}

interface GetAllFlagsResponse {
  flags: GetAllFlagsItemDto[] | null;
}

const flagsFetcher = async (path: string) => {
  const response = await http.get<GetAllFlagsResponse>(path);
  return response.data;
};

export const useGetAllFlags = () => {
  const { data, error, isLoading, mutate } = useSWR<GetAllFlagsResponse>('/api/flags', flagsFetcher);

  const flags = useMemo<Tag[]>(() => {
    const apiFlags = data?.flags ?? [];

    if (error) {
      return ALL_TAGS;
    }

    return apiFlags.map((flag) => ({
      id: flag.id,
      name: flag.name ?? '',
      description: flag.description ?? '',
      category: FLAG_CATEGORY_LABELS[flag.category] ?? 'Культура',
    }));
  }, [data?.flags, error]);

  return {
    flags,
    isLoading: isLoading || !data && !error,
    error,
    mutate,
  };
};
