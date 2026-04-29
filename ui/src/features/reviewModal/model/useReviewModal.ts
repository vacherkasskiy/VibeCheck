import { reviewApi } from 'entities/company';
import { useState, useCallback, useMemo } from 'react';
import type { ReviewFormData, UseReviewModalReturn } from './types';
import type { CreateCompanyReviewRequest } from 'entities/company/model/reviewTypes';


const MIN_FLAGS_REQUIRED = 2;
const MAX_FLAGS_ALLOWED = 8;
const EDIT_TIME_LIMIT_MINUTES = 5;

const initialFormData: ReviewFormData = {
  greenFlags: [],
  redFlags: [],
  text: '',
};

export const useReviewModal = (companyId: string): UseReviewModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reviewId, setReviewId] = useState<string | undefined>(undefined);
  const [createdAt, setCreatedAt] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState<ReviewFormData>({ ...initialFormData });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback((existingReview?: { 
    id: string; 
    text: string; 
    greenFlags: string[]; 
    redFlags: string[]; 
    createdAt: string 
  }) => {
    if (existingReview) {
      setIsEditMode(true);
      setReviewId(existingReview.id);
      setCreatedAt(existingReview.createdAt);
      setFormData({
        greenFlags: existingReview.greenFlags,
        redFlags: existingReview.redFlags,
        text: existingReview.text,
      });
    } else {
      setIsEditMode(false);
      setReviewId(undefined);
      setCreatedAt(undefined);
      setFormData(initialFormData);
    }
    setIsOpen(true);
    setError(null);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setIsEditMode(false);
    setReviewId(undefined);
    setCreatedAt(undefined);
    setError(null);
  }, []);

  const setGreenFlags = useCallback((flags: string[]) => {
    setFormData(prev => ({ ...prev, greenFlags: flags }));
  }, []);

  const setRedFlags = useCallback((flags: string[]) => {
    setFormData(prev => ({ ...prev, redFlags: flags }));
  }, []);

  const setText = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, text }));
  }, []);

  const canSubmit = useMemo(() => {
    const greenCount = formData.greenFlags?.length || 0;
    const redCount = formData.redFlags?.length || 0;
    const totalFlags = greenCount + redCount;
    return totalFlags >= MIN_FLAGS_REQUIRED && totalFlags <= MAX_FLAGS_ALLOWED;
  }, [formData.greenFlags, formData.redFlags]);

  const canDelete = useMemo(() => {
    if (!isEditMode || !createdAt) return false;
    const reviewTime = new Date(createdAt).getTime();
    const now = Date.now();
    const diffMinutes = (now - reviewTime) / (1000 * 60);
    return diffMinutes <= EDIT_TIME_LIMIT_MINUTES;
  }, [isEditMode, createdAt]);

  const submitReview = useCallback(async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const request: CreateCompanyReviewRequest = {
        flags: [...formData.greenFlags, ...formData.redFlags],
        companyId,
        text: formData.text || undefined,
      };

      if (isEditMode && reviewId) {
        // Edit
        await reviewApi.updateCompanyReview(reviewId, { text: formData.text });
      } else {
        // Create
        await reviewApi.createCompanyReview(companyId, request);
      }

      closeModal();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки отзыва');
    } finally {
      setLoading(false);
    }
  }, [canSubmit, formData, isEditMode, reviewId, companyId, closeModal, resetForm]);

  const deleteReview = useCallback(async () => {
    if (!reviewId) return;

    setLoading(true);
    setError(null);

    try {
      await reviewApi.deleteCompanyReview(reviewId);
      closeModal();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления отзыва');
    } finally {
      setLoading(false);
    }
  }, [reviewId, closeModal, resetForm]);

  return {
    isOpen,
    isEditMode,
    reviewId,
    createdAt,
    formData,
    loading,
    error,
    openModal,
    closeModal,
    setGreenFlags,
    setRedFlags,
    setText,
    canSubmit,
    canDelete,
    resetForm,
    submitReview,
    deleteReview,
  };
};
