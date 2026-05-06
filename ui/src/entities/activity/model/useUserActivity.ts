import { useQuery } from '@tanstack/react-query';
import { fetchActivityFeed } from './api';
import type { FeedPageDto, UserFeedDto } from './types';

export const useUserActivity = (limit = 5, enabled = true) => {
  return useQuery({
    queryKey: ['activityFeed', limit],
    queryFn: () => fetchActivityFeed({ limit }),
    enabled,
    select: (data: FeedPageDto) => data.activities?.slice(0, limit) || [],
  });
};
