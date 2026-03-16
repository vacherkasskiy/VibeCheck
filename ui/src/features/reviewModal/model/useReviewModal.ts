import { useState, useCallback, useMemo } from 'react';
import type { ReviewFormData, UseReviewModalReturn } from './types';

const MIN_FLAGS_REQUIRED = 2;
const MAX_FLAGS_ALLOWED = 8;
const EDIT_TIME_LIMIT_MINUTES = 5;

const initialFormData: ReviewFormData = {
  greenFlags: [],
  redFlags: [],
  text: '',
};

export const useReviewModal = (): UseReviewModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reviewId, setReviewId] = useState<string | undefined>(undefined);
  const [createdAt, setCreatedAt] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState<ReviewFormData>({ ...initialFormData });

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
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setIsEditMode(false);
    setReviewId(undefined);
    setCreatedAt(undefined);
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

  return {
    isOpen,
    isEditMode,
    reviewId,
    createdAt,
    formData,
    openModal,
    closeModal,
    setGreenFlags,
    setRedFlags,
    setText,
    canSubmit,
    canDelete,
    resetForm,
  };
};
