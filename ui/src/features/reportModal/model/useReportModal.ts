import { useMutation } from '@tanstack/react-query';
import { reviewApi } from 'entities/company';
import { useCallback, useState } from 'react';
import type { ReportReasonGatewayEnum, ReportReviewRequest } from 'entities/company';

export const useReportModal = () => {
  const [reviewId, setReviewId] = useState<string | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [reasonType, setReasonType] = useState<ReportReasonGatewayEnum>('Spam');
  const [reasonText, setReasonText] = useState('');

  const reportMutation = useMutation({
    mutationFn: ({ targetReviewId, data }: { targetReviewId: string; data: ReportReviewRequest }) =>
      reviewApi.reportReview(targetReviewId, data),
  });

  const open = useCallback((id: string) => {
    setReviewId(id);
    setIsOpen(true);
    setReasonType('Spam');
    setReasonText('');
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setReviewId(undefined);
    setReasonText('');
  }, []);

  const isOther = reasonType === 'Other';
  const isReasonTextValid = !isOther || reasonText.trim().length > 0;
  const isFormValid = isReasonTextValid && reviewId !== undefined && !reportMutation.isPending;

  const submit = useCallback(() => {
    if (!isFormValid || !reviewId) return;
    const data: ReportReviewRequest = {
      reasonType,
      reasonText: reasonText.trim() || undefined,
    };
    reportMutation.mutate(
      { targetReviewId: reviewId, data },
      {
        onSuccess: () => close(),
      },
    );
  }, [isFormValid, reviewId, reasonType, reasonText, reportMutation, close]);

  return {
    isOpen,
    reviewId,
    reasonType,
    setReasonType,
    reasonText,
    setReasonText,
    isOther,
    isFormValid,
    open,
    close,
    submit,
    isSubmitting: reportMutation.isPending,
  };
};
