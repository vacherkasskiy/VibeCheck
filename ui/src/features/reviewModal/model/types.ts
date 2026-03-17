export interface ReviewFormData {
  greenFlags: string[];
  redFlags: string[];
  text: string;
}

export interface ReviewModalState {
  isOpen: boolean;
  isEditMode: boolean;
  reviewId?: string;
  createdAt?: string;
}

export interface UseReviewModalReturn {
  isOpen: boolean;
  isEditMode: boolean;
  reviewId?: string;
  createdAt?: string;
  formData: ReviewFormData;
  openModal: (existingReview?: { id: string; text: string; greenFlags: string[]; redFlags: string[]; createdAt: string }) => void;
  closeModal: () => void;
  setGreenFlags: (flags: string[]) => void;
  setRedFlags: (flags: string[]) => void;
  setText: (text: string) => void;
  canSubmit: boolean;
  canDelete: boolean;
  resetForm: () => void;
}
