import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';
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
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h2 className={styles.modalTitle}>📝 Все отзывы</h2>
					<button className={styles.closeButton} onClick={onClose} type="button">
						✕
					</button>
				</div>

				<div className={styles.reviewsList}>
					{reviews.map((review) => (
						<div key={review.id} className={styles.reviewItem}>
							<div className={styles.reviewHeader}>
								<span className={styles.reviewCompany}>{review.companyName}</span>
								<span className={styles.reviewDate}>
									{formatDate(review.createdAt)}
								</span>
							</div>

							<p className={styles.reviewText}>{review.text}</p>

							<div className={styles.reviewFlags}>
								{review.greenFlags.map((flag, idx) => (
									<span key={`green-${idx}`} className={styles.reviewFlagGreen}>
										{flag}
									</span>
								))}
								{review.redFlags.map((flag, idx) => (
									<span key={`red-${idx}`} className={styles.reviewFlagRed}>
										{flag}
									</span>
								))}
							</div>

							<div className={styles.reviewActions}>
								<div className={styles.reviewReactions}>
									<span>👍 {review.reactions.likes}</span>
									<span>👎 {review.reactions.dislikes}</span>
								</div>
								{canEdit(review.createdAt) && (
									<div className={styles.reviewButtons}>
										<button className={styles.editButton} type="button">
											Редактировать
										</button>
										<button
											className={styles.deleteButton}
											onClick={() => onDelete(review.id)}
											type="button"
										>
											Удалить
										</button>
									</div>
								)}
							</div>
						</div>
					))}
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
