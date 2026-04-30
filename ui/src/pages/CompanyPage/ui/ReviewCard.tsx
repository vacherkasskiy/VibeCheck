import React from 'react';
import styles from './ReviewCard.module.css';
import type { CompanyReview, ReviewFlagDto, VoteModeGatewayEnum } from 'entities/company';

interface ReviewCardProps {
	review: CompanyReview;
	onClick?: () => void;
	myVote?: VoteModeGatewayEnum;
	onVote?: (mode: VoteModeGatewayEnum) => void;
	isVoting?: boolean;
	onReport?: (reviewId: string) => void;
}

export const ReviewCard = ({ 
	review, 
	onClick, 
	myVote, 
	onVote, 
	isVoting = false,
	onReport,
}: ReviewCardProps) => {
	const authorName = `User ${review.authorId.slice(0, 8)}`;
	const flags = review.flags ?? [];
	const likes = Math.max(review.score, 0);
	const dislikes = Math.max(-review.score, 0);

	const handleVote = (mode: VoteModeGatewayEnum) => (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onVote && !isVoting) {
			const nextMode = myVote === mode ? 'Clear' : mode;
			onVote(nextMode);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	const isLikeActive = myVote === 'Like';
	const isDislikeActive = myVote === 'Dislike';

	return (
		<div 
			className={styles.card}
			onClick={onClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onClick?.();
				}
			}}
		>
			<div className={styles.header}>
				<span className={styles.companyName}>Компания</span>
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
				<button 
					className={[
						styles.reaction,
						isLikeActive && styles['reaction--active']
					].filter(Boolean).join(' ')} 
					type="button" 
					onClick={handleVote('Like')}
					disabled={isVoting}
				>
					<span className={styles.reactionIcon}>👍</span>
					<span className={styles.reactionCount}>{likes}</span>
				</button>
				<button 
					className={[
						styles.reaction,
						isDislikeActive && styles['reaction--dislike-active']
					].filter(Boolean).join(' ')} 
					type="button" 
					onClick={handleVote('Dislike')}
					disabled={isVoting}
				>
					<span className={styles.reactionIcon}>👎</span>
					<span className={styles.reactionCount}>{dislikes}</span>
				</button>
				<button 
					className={styles.reportButton} 
					type="button" 
					onClick={(e) => {
						e.stopPropagation();
						if (onReport) onReport(review.reviewId);
					}}
				>
					⚠️ Пожаловаться
				</button>
			</div>
		</div>
	);
};
