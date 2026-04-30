import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import type { UserReview } from 'entities/user';

interface ReviewsModalProps {
	isOpen: boolean;
	onClose: () => void;
	reviews: UserReview[];
	onDelete: (reviewId: string) => void;
	canEdit: (createdAt: string) => boolean;
}

export const ReviewsModal = ({
	isOpen,
	onClose,
	reviews,
	onDelete,
	canEdit,
}: ReviewsModalProps) => {
	const navigate = useNavigate();
	const [selectedReview, setSelectedReview] = useState<UserReview | null>(null);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	const handleClose = () => {
		setSelectedReview(null);
		onClose();
	};

	const handleAuthorClick = (authorId?: string | null) => {
		if (!authorId) return;
		handleClose();
		navigate(`/user/${authorId}`);
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose}>
			<div className={`${styles.modalContent} ${selectedReview ? styles.reviewDetailsModal : ''}`}>
				<div className={styles.modalHeader}>
					<h2 className={styles.modalTitle}>
						{selectedReview ? 'Полный отзыв' : '📝 Все отзывы'}
					</h2>
					<button className={styles.closeButton} onClick={handleClose} type="button">
						✕
					</button>
				</div>

				{selectedReview ? (
					<div className={styles.reviewDetails}>
						<button
							className={styles.backButton}
							onClick={() => setSelectedReview(null)}
							type="button"
						>
							<ArrowLeft size={16} />
							К списку отзывов
						</button>

						<div className={styles.reviewDetailsGrid}>
							<div className={styles.reviewMetaCard}>
								<span className={styles.reviewMetaLabel}>Компания</span>
								<span className={styles.reviewMetaValue}>{selectedReview.companyName}</span>
							</div>
							<div className={styles.reviewMetaCard}>
								<span className={styles.reviewMetaLabel}>Дата</span>
								<span className={styles.reviewMetaValue}>{formatDate(selectedReview.createdAt)}</span>
							</div>
							<div className={styles.reviewMetaCard}>
								<span className={styles.reviewMetaLabel}>Оценка</span>
								<span className={styles.reviewMetaValue}>
									👍 {selectedReview.reactions.likes} · 👎 {selectedReview.reactions.dislikes}
								</span>
							</div>
							<div className={styles.reviewMetaCard}>
								<span className={styles.reviewMetaLabel}>ID отзыва</span>
								<span className={styles.reviewMetaValue}>{selectedReview.id}</span>
							</div>
						</div>

						<div className={styles.reviewAuthorCard}>
							<div className={styles.reviewAuthorInfo}>
								{selectedReview.authorAvatarUrl ? (
									<img
										src={selectedReview.authorAvatarUrl}
										alt={selectedReview.authorName ?? 'Автор'}
										className={styles.reviewAuthorAvatar}
									/>
								) : (
									<div className={styles.reviewAuthorAvatarPlaceholder}>
										{(selectedReview.authorName ?? 'А').charAt(0).toUpperCase()}
									</div>
								)}
								<div>
									<span className={styles.reviewMetaLabel}>Автор</span>
									<div className={styles.reviewAuthorName}>
										{selectedReview.authorName ?? selectedReview.authorId ?? 'Автор отзыва'}
									</div>
								</div>
							</div>
							<Button
								onClick={() => handleAuthorClick(selectedReview.authorId)}
								variant="secondary"
								size="small"
								disabled={!selectedReview.authorId}
							>
								<ExternalLink size={16} />
								Профиль
							</Button>
						</div>

						{selectedReview.flags.length > 0 && (
							<div className={styles.reviewFlags}>
								{selectedReview.flags.map((flag, idx) => (
									<span key={`${flag}-${idx}`} className={styles.reviewFlag}>
										{flag}
									</span>
								))}
							</div>
						)}

						<div className={styles.fullReviewText}>{selectedReview.text}</div>
					</div>
				) : (
					<div className={styles.reviewsList}>
						{reviews.map((review) => (
							<button
								key={review.id}
								className={styles.reviewItem}
								onClick={() => setSelectedReview(review)}
								type="button"
							>
								<div className={styles.reviewHeader}>
									<span className={styles.reviewCompany}>{review.companyName}</span>
									<span className={styles.reviewDate}>
										{formatDate(review.createdAt)}
									</span>
								</div>

								<p className={styles.reviewText}>{review.text}</p>

								{review.flags.length > 0 && (
									<div className={styles.reviewFlags}>
										{review.flags.map((flag, idx) => (
											<span key={`${flag}-${idx}`} className={styles.reviewFlag}>
												{flag}
											</span>
										))}
									</div>
								)}

								<div className={styles.reviewActions}>
									<div className={styles.reviewReactions}>
										<span>👍 {review.reactions.likes}</span>
										<span>👎 {review.reactions.dislikes}</span>
									</div>
									{canEdit(review.createdAt) && (
										<div className={styles.reviewButtons}>
											<span className={styles.editButton}>Редактировать</span>
											<span
												className={styles.deleteButton}
												onClick={(event) => {
													event.stopPropagation();
													onDelete(review.id);
												}}
											>
												Удалить
											</span>
										</div>
									)}
								</div>
							</button>
						))}
					</div>
				)}

				<div className={styles.modalFooter}>
					<Button onClick={handleClose} variant="secondary" size="small">
						Закрыть
					</Button>
				</div>
			</div>
		</Modal>
	);
};
