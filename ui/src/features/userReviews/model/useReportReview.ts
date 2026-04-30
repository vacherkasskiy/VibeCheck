import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from 'entities/company';
import type { ReportReviewRequest } from 'entities/company';

type ReportReviewVariables = {
  reviewId: string;
  data: ReportReviewRequest;
};

export const useReportReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: ReportReviewVariables) => reviewApi.reportReview(reviewId, data),
    onSuccess: () => {
      console.log('Жалоба отправлена');
      queryClient.invalidateQueries({ queryKey: ['companyReviews'] });
      queryClient.invalidateQueries({ queryKey: ['UserReviews'] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      let message = 'Ошибка отправки жалобы';
      if (status === 401) message = 'Не авторизован';
      else if (status === 403) message = 'Доступ запрещён';
      else if (status === 404) message = 'Отзыв не найден';
      else if (status === 500) message = 'Серверная ошибка';
      console.error(message, error);
      alert(message); // Simple toast simulation
    },
  });
};

