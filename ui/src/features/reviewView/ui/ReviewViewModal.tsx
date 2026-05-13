import { useUserFlags } from 'entities/user';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewScore } from 'shared/ui';
import styles from './ReviewViewModal.module.css';
import type { CompanyReview, ReviewFlagDto, VoteModeGatewayEnum } from 'entities/company';
import type { UserFlag } from 'entities/user';

export interface ReviewViewModalProps {
	isOpen: boolean;
	review: CompanyReview | null;
	companyName: string;
	onClose: () => void;
	authorName?: string;
	authorAvatarUrl?: string | null;
	myVote?: VoteModeGatewayEnum;
	onVote?: (mode: VoteModeGatewayEnum) => void;
	isVoting?: boolean;
	onReport?: (reviewId: string) => void;
}

export const ReviewViewModal = ({
	isOpen,
	review,
	companyName,
	onClose,
	authorName,
	authorAvatarUrl,
	myVote,
	onVote,
	isVoting = false,
	onReport,
}: ReviewViewModalProps) => {
	const navigate = useNavigate();

	const {
		flags: { green: userGreenFlags, red: userRedFlags },
	} = useUserFlags();

	if (!review || !isOpen) return null;

	const resolvedAuthorName =
		authorName ?? review.authorName ?? `User ${review.authorId.slice(0, 8)}`;

	const authorAvatar = authorAvatarUrl ?? review.authorAvatarUrl ?? review.iconId;
	const flags = review.flags ?? [];

	const getFlagColor = (flagId: string): 'green' | 'red' | 'gray' => {
		const isGreen = userGreenFlags.some((f: UserFlag) => f.id === flagId);
		const isRed = userRedFlags.some((f: UserFlag) => f.id === flagId);

		if (isGreen) return 'green';
		if (isRed) return 'red';
		return 'gray';
	};

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
		if (!review.authorId) return;

		onClose();
		navigate(`/user/${review.authorId}`);
	};

	const handleVote = (mode: VoteModeGatewayEnum) => (e?: React.MouseEvent) => {
		e?.stopPropagation();

		if (!onVote || isVoting) return;

		const nextMode = myVote === mode ? 'Clear' : mode;
		onVote(nextMode);
	};

	const isLikeActive = myVote === 'Like';
	const isDislikeActive = myVote === 'Dislike';

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
					<h2 className={styles.title}>Полный отзыв o {companyName}</h2>

					<button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
						×
					</button>
				</div>

				<div className={styles.body}>
					<div className={styles.reviewDetailsGrid}>
						<div className={styles.reviewAuthorInfo}>
							{authorAvatar ? (
								<img
									src={authorAvatar}
									alt={resolvedAuthorName}
									className={styles.reviewAuthorAvatar}
								/>
							) : (
								<div className={styles.reviewAuthorAvatarPlaceholder}>
									{resolvedAuthorName.charAt(0).toUpperCase()}
								</div>
							)}

							<div>
								<span className={styles.reviewMetaLabel}>Автор</span>

								{review.authorId ? (
									<button
										className={styles.authorName}
										onClick={handleAuthorClick}
										type="button"
									>
										{resolvedAuthorName}
									</button>
								) : (
									<span className={styles.authorNameStatic}>
										{resolvedAuthorName}
									</span>
								)}
							</div>
						</div>

						<div className={styles.reviewMetaCard}>
							<span className={styles.reviewMetaLabel}>Дата</span>
							<span className={styles.reviewMetaValue}>
								{formatDate(review.createdAt)}
							</span>
						</div>
					</div>

					{flags.length > 0 && (
						<div className={styles.flags}>
							{flags.map((flag: ReviewFlagDto) => {
								const color = getFlagColor(flag.id);

								return (
									<span
										key={flag.id}
										className={`${styles.flag} ${styles[color]}`}
									>
										{flag.name ?? 'Флаг'}
									</span>
								);
							})}
						</div>
					)}

					{review.text && <div className={styles.fullText}>{review.text}</div>}

					<div className={styles.reactions}>
						<div className={styles.reviewScoreWrap}>
							<ReviewScore
								score={review.score}
								onUpClick={handleVote('Like')}
								onDownClick={handleVote('Dislike')}
								isUpActive={isLikeActive}
								isDownActive={isDislikeActive}
								disabled={isVoting}
							/>
						</div>

						{onReport && (
							<button
								className={styles.reportButton}
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onReport(review.reviewId);
								}}
							>
								⚠️ Пожаловаться
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};