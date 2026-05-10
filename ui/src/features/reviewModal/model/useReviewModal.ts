import { reviewApi, invalidateCompanyReviewCaches } from 'entities/company';
import { useState, useCallback, useMemo } from 'react';
import type { ReviewFormData, UseReviewModalReturn } from './types';
import type { CreateCompanyReviewRequest } from 'entities/company';



const MIN_FLAGS_REQUIRED = 2;
const MAX_FLAGS_ALLOWED = 8;
const EDIT_TIME_LIMIT_MINUTES = 5;

const initialFormData: ReviewFormData = {
  greenFlags: [],
  redFlags: [],
  text: '',
};

const normalizeFormData = (
  value?: Partial<ReviewFormData> | null,
): ReviewFormData => ({
  greenFlags: Array.isArray(value?.greenFlags) ? [...value.greenFlags] : [],
  redFlags: Array.isArray(value?.redFlags) ? [...value.redFlags] : [],
  text: typeof value?.text === 'string' ? value.text : '',
});

export const useReviewModal = (
  companyId: string,
  onReviewChanged?: () => void,
): UseReviewModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reviewId, setReviewId] = useState<string | undefined>(undefined);
  const [createdAt, setCreatedAt] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState<ReviewFormData>(normalizeFormData(initialFormData));
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
      setFormData(normalizeFormData({
        greenFlags: existingReview.greenFlags,
        redFlags: existingReview.redFlags,
        text: existingReview.text,
      }));
    } else {
      setIsEditMode(false);
      setReviewId(undefined);
      setCreatedAt(undefined);
      setFormData(normalizeFormData(initialFormData));
    }
    setIsOpen(true);
    setError(null);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(normalizeFormData(initialFormData));
    setIsEditMode(false);
    setReviewId(undefined);
    setCreatedAt(undefined);
    setError(null);
  }, []);

  const setGreenFlags = useCallback((flags: string[]) => {
    setFormData(prev => ({ ...prev, greenFlags: Array.isArray(flags) ? [...flags] : [] }));
  }, []);

  const setRedFlags = useCallback((flags: string[]) => {
    setFormData(prev => ({ ...prev, redFlags: Array.isArray(flags) ? [...flags] : [] }));
  }, []);

  const setText = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, text }));
  }, []);

  const canSubmit = useMemo(() => {
    if (isEditMode) {
      return true;
    }

    const greenCount = formData.greenFlags?.length || 0;
    const redCount = formData.redFlags?.length || 0;
    const totalFlags = greenCount + redCount;
    return totalFlags >= MIN_FLAGS_REQUIRED && totalFlags <= MAX_FLAGS_ALLOWED;
  }, [formData.greenFlags, formData.redFlags, isEditMode]);

  const canDelete = (() => {
    if (!isEditMode || !createdAt) return false;
    const reviewTime = new Date(createdAt).getTime();
    const now = Date.now();
    const diffMinutes = (now - reviewTime) / (1000 * 60);
    return diffMinutes <= EDIT_TIME_LIMIT_MINUTES;
  })();

  const submitReview = useCallback(async (): Promise<boolean> => {
    if (!canSubmit) return false;

    setLoading(true);
    setError(null);

    try {
      const greenFlags = Array.isArray(formData.greenFlags) ? formData.greenFlags : [];
      const redFlags = Array.isArray(formData.redFlags) ? formData.redFlags : [];

      const request: CreateCompanyReviewRequest = {
        flags: [...greenFlags, ...redFlags],
        companyId,
        text: formData.text.trim() || undefined,
      };

      if (isEditMode && reviewId) {
        await reviewApi.updateCompanyReview(reviewId, { text: formData.text.trim() || undefined });
      } else {
        await reviewApi.createCompanyReview(companyId, request);
      }

      await invalidateCompanyReviewCaches(companyId);
      await onReviewChanged?.();
      closeModal();
      resetForm();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки отзыва');
      return false;
    } finally {
      setLoading(false);
    }
  }, [canSubmit, formData, isEditMode, reviewId, companyId, closeModal, resetForm, onReviewChanged]);


  const deleteReview = useCallback(async (): Promise<boolean> => {
    if (!reviewId) return false;

    setLoading(true);
    setError(null);

    try {
      await reviewApi.deleteCompanyReview(reviewId);
      await invalidateCompanyReviewCaches(companyId);
      await onReviewChanged?.();
      closeModal();
      resetForm();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления отзыва');
      return false;
    } finally {
      setLoading(false);
    }
  }, [reviewId, closeModal, resetForm, onReviewChanged, companyId]);

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
