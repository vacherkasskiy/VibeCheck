// eslint-disable-next-line @conarti/feature-sliced/layers-slices
import { reviewHttp } from 'features/reviewAuth';
import useSWR from 'swr';
import { ALL_TAGS } from './mock';
import type { Tag } from './types';

interface GetAllFlagsItemDto {
  id: string;
  name: string | null;
  category: string;
  description: string | null;
}

interface GetAllFlagsResponse {
  flags: GetAllFlagsItemDto[] | null;
}

const reviewFetcher = async (_key: string, url: string[]) => {
  const path = url[0] as string;
  if (!reviewHttp) {
    throw new Error('Review HTTP not ready');
  }
  const response = await reviewHttp.get<GetAllFlagsResponse>(path);
  return response.data;
};

export const useGetAllFlags = () => {
  const { data, error, isLoading, mutate } = useSWR<GetAllFlagsResponse>(['/api/flags'], reviewFetcher);

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

