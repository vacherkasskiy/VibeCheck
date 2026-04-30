import { useQuery } from '@tanstack/react-query';
import { fetchActivityFeed } from './api';
import type { FeedPageDto, UserFeedDto } from './types';

export const useUserActivity = (userId?: string, limit = 5) => {
  return useQuery({
    queryKey: ['userActivity', userId],
    queryFn: () => fetchActivityFeed({ limit, userId }),
    enabled: !!userId,
    select: (data: FeedPageDto) => data.activities?.slice(0, limit) || [],
  });
};
