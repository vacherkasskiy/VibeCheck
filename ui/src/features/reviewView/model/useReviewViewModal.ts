import { useState } from 'react';
import type { CompanyReview } from 'entities/company';

interface UseReviewViewModalReturn {
  isOpen: boolean;
  selectedReview: CompanyReview | null;
  openReview: (review: CompanyReview) => void;
  close: () => void;
}

export const useReviewViewModal = (): UseReviewViewModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<CompanyReview | null>(null);

  const openReview = (review: CompanyReview) => {
    setSelectedReview(review);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setSelectedReview(null);
  };

  return {
    isOpen,
    selectedReview,
    openReview,
    close,
  };
};

