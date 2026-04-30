import React from 'react';
import { Button } from 'shared/ui/Button';
import { Select } from 'shared/ui/Select';
import styles from './ReportModal.module.css';
import type { ReportReasonGatewayEnum, ReportReviewRequest } from 'entities/company';

interface ReportModalProps {
  isOpen: boolean;
  reviewId: string | undefined;
  onClose: () => void;
  onSubmit: (data: ReportReviewRequest) => void;
}

const reasonOptions: Array<{ value: ReportReasonGatewayEnum; label: string }> = [
  { value: 'Spam', label: 'Спам' },
  { value: 'Harassment', label: 'Харассмент' },
  { value: 'Hate', label: 'Ненависть' },
  { value: 'Nudity', label: 'Неприличный контент' },
  { value: 'Violence', label: 'Насилие' },
  { value: 'Other', label: 'Другое' },
];

export const ReportModal = ({ isOpen, reviewId, onClose, onSubmit }: ReportModalProps) => {
  const [reasonType, setReasonType] = React.useState<ReportReasonGatewayEnum>('Spam');
  const [reasonText, setReasonText] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isOther = reasonType === 'Other';
  const isReasonTextValid = !isOther || (reasonText.trim().length > 0 && reasonText.trim().length <= 500);
  const isFormValid = isReasonTextValid && reviewId !== undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    onSubmit({ reasonType, reasonText: reasonText.trim() || undefined });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Пожаловаться на отзыв</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Причина:</label>
            <Select
              value={reasonType}
              onChange={(value) => {
                setReasonType(value as ReportReasonGatewayEnum);
                if (value !== 'Other') setReasonText('');
              }}
              options={reasonOptions}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Описание (необязательно):</label>
            <textarea
              className={`${styles.textarea} ${isOther && !isReasonTextValid ? styles.textareaError : ''}`}
              placeholder={isOther ? 'Обязательное описание (макс. 500 символов)' : 'Дополнительное описание'}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            {isOther && !isReasonTextValid && <span className={styles.error}>Описание обязательно для "Другое"</span>}
            <span className={styles.counter}>{reasonText.length}/500</span>
          </div>
          <div className={styles.buttons}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Отмена
            </Button>
  <Button 
              type="submit" 
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить жалобу'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
