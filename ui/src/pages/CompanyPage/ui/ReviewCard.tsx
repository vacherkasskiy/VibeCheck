import React from 'react';
import styles from './ReviewCard.module.css';
import type { CompanyReview, ReviewFlagDto } from 'entities/company';

interface ReviewCardProps {
	review: CompanyReview;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
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
		});
	};

	return (
		<div className={styles.card}>
			<div className={styles.header}>
				<div className={styles.author}>
					{review.iconId ? (
						<img
							src={review.iconId}
							alt={authorName}
							className={styles.avatar}
						/>
					) : (
						<div className={styles.avatarPlaceholder}>
							{authorName.charAt(0).toUpperCase()}
						</div>
					)}
					<div className={styles.authorInfo}>
						<span className={styles.authorName}>{authorName}</span>
					</div>
				</div>
				<span className={styles.date}>{formatDate(review.createdAt)}</span>
			</div>

			{review.text && <p className={styles.text}>{review.text}</p>}

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
				<button className={styles.reaction} type="button">
					<span className={styles.reactionIcon}>👍</span>
					<span className={styles.reactionCount}>{likes}</span>
				</button>
				<button className={styles.reaction} type="button">
					<span className={styles.reactionIcon}>👎</span>
					<span className={styles.reactionCount}>{dislikes}</span>
				</button>
			</div>
		</div>
	);
};
