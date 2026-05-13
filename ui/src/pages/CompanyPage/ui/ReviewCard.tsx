import { useUserFlags } from 'entities/user';
import React from 'react';
import { ReviewScore } from 'shared/ui';
import styles from './ReviewCard.module.css';
import type { CompanyReview, ReviewFlagDto, VoteModeGatewayEnum } from 'entities/company';
import type { UserFlag } from 'entities/user';

interface ReviewCardProps {
	review: CompanyReview;
	onClick?: () => void;
	myVote?: VoteModeGatewayEnum;
	onVote?: (mode: VoteModeGatewayEnum) => void;
	isVoting?: boolean;
	onReport?: (reviewId: string) => void;
	canManage?: boolean;
	onEdit?: (review: CompanyReview) => void;
}

export const ReviewCard = ({
	review,
	onClick,
	myVote,
	onVote,
	isVoting = false,
	onReport,
	canManage = false,
	onEdit,
}: ReviewCardProps) => {
	const flags = review.flags ?? [];
	const authorName = review.authorName?.trim() || `User ${review.authorId.slice(0, 8)}`;
	const authorAvatarUrl = review.authorAvatarUrl ?? review.iconId;

	const {
		flags: { green: userGreenFlags, red: userRedFlags },
	} = useUserFlags();

	const getFlagColor = (flagId: string): 'green' | 'red' | 'gray' => {
		const isGreen = userGreenFlags.some((f: UserFlag) => f.id === flagId);
		const isRed = userRedFlags.some((f: UserFlag) => f.id === flagId);

		if (isGreen) return 'green';
		if (isRed) return 'red';
		return 'gray';
	};

	const handleVote = (mode: VoteModeGatewayEnum) => (e?: React.MouseEvent) => {
		e?.stopPropagation();

		if (!onVote || isVoting) return;

		const nextMode = myVote === mode ? 'Clear' : mode;
		onVote(nextMode);
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
				<div className={styles.authorMeta}>
					{authorAvatarUrl ? (
						<img src={authorAvatarUrl} alt={authorName} className={styles.avatar} />
					) : (
						<div className={styles.avatarPlaceholder}>
							{authorName.charAt(0).toUpperCase()}
						</div>
					)}

					<span className={styles.companyName}>{authorName}</span>
				</div>

				<span className={styles.date}>{formatDate(review.createdAt)}</span>
			</div>

			{flags.length > 0 && (
				<div className={styles.flags}>
					{flags.map((flag: ReviewFlagDto) => {
						const color = getFlagColor(flag.id);

						return (
							<span key={flag.id} className={`${styles.flag} ${styles[color]}`}>
								{flag.name ?? 'Флаг'}
							</span>
						);
					})}
				</div>
			)}

			{review.text && <p className={styles.text}>{review.text}</p>}

			<div className={styles.reactions}>
				<ReviewScore
					score={review.score}
					onUpClick={handleVote('Like')}
					onDownClick={handleVote('Dislike')}
					isUpActive={isLikeActive}
					isDownActive={isDislikeActive}
					disabled={isVoting}
				/>

				{canManage && (
					<button
						className={styles.reportButton}
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onEdit?.(review);
						}}
					>
						Редактировать
					</button>
				)}

				<button
					className={styles.reportButton}
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onReport?.(review.reviewId);
					}}
				>
					⚠️ Пожаловаться
				</button>
			</div>
		</div>
	);
};