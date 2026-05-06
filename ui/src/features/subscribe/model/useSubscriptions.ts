import { useQuery } from '@tanstack/react-query';
import { userApi } from 'entities/user';

export const useUserSubscriptions = (userId?: string | number) =>
  useQuery({
    queryKey: ['userSubscriptions', userId?.toString()],
    queryFn: () => userApi.fetchUserSubscriptions(userId!.toString()),
    enabled: !!userId,
  });
