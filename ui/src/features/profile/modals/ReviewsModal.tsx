import { ReviewScore } from 'shared/ui';
import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';
import styles from './styles.module.css';
import type { UserReview } from 'entities/user';

interface ReviewsModalProps {
	isOpen: boolean;
	onClose: () => void;
	reviews: UserReview[];
	onOpenReview: (review: UserReview) => void;
	onEdit: (reviewId: string) => void;
	onDelete: (reviewId: string) => void;
	canEdit: (createdAt: string) => boolean;
}

export const ReviewsModal = ({
	isOpen,
	onClose,
	reviews,
	onOpenReview,
	onEdit,
	onDelete,
	canEdit,
}: ReviewsModalProps) => {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} className={styles.modalShell}>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h2 className={styles.modalTitle}>Все отзывы</h2>
					<button className={styles.closeButton} onClick={onClose} type="button">
						✕
					</button>
				</div>

				<div className={styles.reviewsList}>
					{reviews.map((review) => (
						<button
							key={review.id}
							className={styles.reviewItem}
							onClick={() => onOpenReview(review)}
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
									<ReviewScore score={review.score} compact />
								</div>
								{canEdit(review.createdAt) && (
									<div className={styles.reviewButtons}>
										<span
											className={styles.editButton}
											onClick={(event) => {
												event.stopPropagation();
												onEdit(review.id);
											}}
										>
											Редактировать
										</span>
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
					{reviews.length === 0 && <p className={styles.emptyMessage}>Пока нет отзывов</p>}
				</div>

				<div className={styles.modalFooter}>
					<Button onClick={onClose} variant="secondary" size="small">
						Закрыть
					</Button>
				</div>
			</div>
		</Modal>
	);
};
