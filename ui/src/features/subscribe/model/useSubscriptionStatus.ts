import { useQuery } from '@tanstack/react-query';
import { userApi } from 'entities/user';

export const useSubscriptionStatus = (
  authorId?: string | number,
  isOwnProfile?: boolean,
) =>
  useQuery({
    queryKey: ['subscriptionStatus', authorId?.toString()],
    queryFn: () => userApi.fetchSubscriptionStatus(authorId!.toString()),
    enabled: !!authorId && !isOwnProfile,
  });
