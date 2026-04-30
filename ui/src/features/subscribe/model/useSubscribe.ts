import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from 'entities/user';

const invalidateSubscriptionQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  authorId: string,
) => {
  queryClient.invalidateQueries({ queryKey: ['subscriptionStatus', authorId] });
  queryClient.invalidateQueries({ queryKey: ['userSubscriptions'] });
  queryClient.invalidateQueries({ queryKey: ['activityFeed'] });
  queryClient.invalidateQueries({ queryKey: ['profile'] });
};

export const useSubscribeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (authorId: string | number) => userApi.subscribeToUser(authorId.toString()),
    onSuccess: (_data, authorId) => {
      invalidateSubscriptionQueries(queryClient, authorId.toString());
    },
  });
};

export const useUnsubscribeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (authorId: string | number) => userApi.unsubscribeFromUser(authorId.toString()),
    onSuccess: (_data, authorId) => {
      invalidateSubscriptionQueries(queryClient, authorId.toString());
    },
  });
};
