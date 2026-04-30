import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from 'entities/company';
import type { VoteModeGatewayEnum } from 'entities/company';

export const useVoteReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, mode }: { reviewId: string; mode: VoteModeGatewayEnum }) => reviewApi.voteReview(reviewId, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyReviews'] });
      queryClient.invalidateQueries({ queryKey: ['UserReviews'] });
    },
  });
};
