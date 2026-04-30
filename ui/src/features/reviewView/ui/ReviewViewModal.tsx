import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ReviewViewModal.module.css';
import type { CompanyReview, ReviewFlagDto } from 'entities/company';

export interface ReviewViewModalProps {
  isOpen: boolean;
  review: CompanyReview | null;
  onClose: () => void;
}

export const ReviewViewModal = ({ isOpen, review, onClose }: ReviewViewModalProps) => {
  const navigate = useNavigate();

  if (!review || !isOpen) return null;

  const authorName = `User ${review.authorId.slice(0, 8)}`;
  const flags = review.flags ?? [];
  const likes = Math.max(review.score, 0);
  const dislikes = Math.max(-review.score, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAuthorClick = () => {
    onClose();
    navigate(`/user/${review.authorId}`);
  };

  return (
    <div 
      className={styles.overlay} 
      aria-hidden={!isOpen} 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр отзыва"
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Отзыв</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className={styles.body}>
          <div className={styles.reviewHeader}>
            <div className={styles.authorSection}>
              {review.iconId ? (
                <img src={review.iconId} alt={authorName} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={styles.authorInfo}>
                <button 
                  className={styles.authorName}
                  onClick={handleAuthorClick}
                  type="button"
                >
                  {authorName}
                </button>
                <div className={styles.date}>{formatDate(review.createdAt)}</div>
              </div>
            </div>
          </div>

          {review.text && (
            <div className={styles.fullText}>{review.text}</div>
          )}

          {flags.length > 0 && (
            <div className={styles.flags}>
              {flags.map((flag: ReviewFlagDto) => (
                <span key={flag.id} className={styles.flag}>
                  {flag.name ?? 'Флаг'}
                </span>
              ))}
            </div>
          )}

          <div className={styles.reactions}>
            <div className={styles.reactionCount}>
              👍 {likes} / 👎 {dislikes}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

