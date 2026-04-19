import useSWR from 'swr';
import { ALL_TAGS } from './mock';
import type { Tag } from './types';

interface GetAllFlagsResponse {
  flags: Array<{
    id: string;
    name: string | null;
    category: string;
    description: string | null;
  }> | null;
}

export const useGetAllFlags = () => {
  const { data, error, isLoading, mutate } = useSWR<GetAllFlagsResponse>('/api/flags');

  const apiFlags = data?.flags ?? [];
  const flags: Tag[] = error ? ALL_TAGS : apiFlags.map(f => ({
    id: f.id,
    name: f.name ?? '',
    description: f.description ?? '',
    category: f.category as any,
  })); 

  return {
    flags,
    isLoading: isLoading || !data && !error,
    error,
    mutate,
  };
};
