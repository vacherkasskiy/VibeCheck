import http from 'shared/api/http';
import type { FeedPageDto } from './types';

interface ActivityFeedParams {
  limit: number;
  cursorCreatedAt?: string;
  cursorActivityId?: string;
}

export const fetchActivityFeed = async (params: ActivityFeedParams): Promise<FeedPageDto> => {
  const response = await http.get<FeedPageDto>('/activity', params);
  return response.data;
};
