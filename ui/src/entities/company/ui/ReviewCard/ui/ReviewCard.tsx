import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import type { CompanyReview, CompanyFlag } from '../../../model/types';

interface ReviewCardProps {
	review: CompanyReview;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
	const navigate = useNavigate();
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	return (
		<div className={styles.card}>
			<div className={styles.header}>
				<div className={styles.author}>
					{review.authorAvatarUrl ? (
						<img
							src={review.authorAvatarUrl}
							alt={review.authorName}
							className={styles.avatar}
						/>
					) : (
						<div className={styles.avatarPlaceholder}>
							{review.authorName.charAt(0).toUpperCase()}
						</div>
					)}
					<div className={styles.authorInfo}>
						<button
							type="button"
							className={styles.authorName}
							onClick={() => navigate(`/user/${review.authorId}`)}
						>
							{review.authorName}
						</button>
						{review.position && (
							<span className={styles.position}>{review.position}</span>
						)}
					</div>
				</div>
				<span className={styles.date}>{formatDate(review.createdAt)}</span>
			</div>

			<p className={styles.text}>{review.text}</p>

			{review.flags.length > 0 && (
				<div className={styles.flags}>
					{review.flags.map((flag: CompanyFlag) => (
						<span key={flag.id} className={styles.flag}>
							{flag.name}
						</span>
					))}
				</div>
			)}

			<div className={styles.reactions}>
				<button className={styles.reaction} type="button">
					<span className={styles.reactionIcon}>👍</span>
					<span className={styles.reactionCount}>{review.reactions.likes}</span>
				</button>
				<button className={styles.reaction} type="button">
					<span className={styles.reactionIcon}>👎</span>
					<span className={styles.reactionCount}>{review.reactions.dislikes}</span>
				</button>
			</div>
		</div>
	);
};
