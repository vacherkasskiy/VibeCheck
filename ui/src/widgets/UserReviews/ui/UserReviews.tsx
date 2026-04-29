import { FileText, ThumbsUp, ThumbsDown, Pencil, Trash2 } from 'lucide-react';
import { Button } from 'shared/ui/Button';
import styles from './styles.module.css';
import type { UserReview } from 'entities/user';

interface UserReviewsProps {
	reviews: UserReview[];
	onViewAll: () => void;
	onEdit?: (reviewId: string) => void;
	onDelete?: (reviewId: string) => void;
}

export const UserReviews = ({ reviews, onViewAll, onEdit, onDelete }: UserReviewsProps) => {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	const canEdit = (createdAt: string): boolean => {
		const created = new Date(createdAt).getTime();
		const now = Date.now();
		const fiveMinutes = 5 * 60 * 1000;
		return now - created <= fiveMinutes;
	};

	const displayReviews = reviews.slice(0, 2);

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h2 className={styles.title}>
					<FileText size={20} />
					{onEdit ? 'Мои отзывы' : 'Отзывы пользователя'}
				</h2>
				{reviews.length > 2 && (
					<Button onClick={onViewAll} variant="secondary" size="small">
						Посмотреть все
					</Button>
				)}
			</div>

			<div className={styles.reviewsList}>
				{displayReviews.length > 0 ? (
					displayReviews.map((review) => (
						<div key={review.id} className={styles.reviewCard}>
							<div className={styles.reviewHeader}>
								<span className={styles.companyName}>{review.companyName}</span>
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

							<div className={styles.reviewFooter}>
								<div className={styles.reactions}>
									<span>
										<ThumbsUp size={16} /> {review.reactions.likes}
									</span>
									<span>
										<ThumbsDown size={16} /> {review.reactions.dislikes}
									</span>
								</div>

								{onEdit && onDelete && (
									<div className={styles.actions}>
										{canEdit(review.createdAt) && (
											<button
												className={styles.editButton}
												onClick={() => onEdit(review.id)}
												type="button"
												title="Редактировать"
											>
												<Pencil size={16} />
											</button>
										)}
										<button
											className={styles.deleteButton}
											onClick={() => onDelete(review.id)}
											type="button"
											title="Удалить"
										>
											<Trash2 size={16} />
										</button>
									</div>
								)}
							</div>
						</div>
					))
				) : (
					<p className={styles.empty}>Пока нет отзывов</p>
				)}
			</div>
		</div>
	);
};
