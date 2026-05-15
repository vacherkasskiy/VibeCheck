import { useCompanyReviews } from 'features/companyPage';
import { ReportModal, useReportModal } from 'features/reportModal';
import { ReviewViewModal, useReviewViewModal } from 'features/reviewView';
import { useVoteReviewMutation } from 'features/userReviews';
import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCurrentUserId } from 'shared/lib';
import { Button } from 'shared/ui/Button';
import { Select } from 'shared/ui/Select';
import { ReviewCard } from './ReviewCard';
import styles from './ReviewsSection.module.css';
import type {
	CompanyReview,
	CurrentUserReactionGatewayEnum,
	ReviewsSortGatewayEnum,
	VoteModeGatewayEnum,
} from 'entities/company';

type SortOption = {
	value: ReviewsSortGatewayEnum;
	label: string;
};

interface ReviewsSectionProps {
	className?: string;
	companyName: string;
	refreshKey?: number;
	onEditReview?: (review: CompanyReview) => void;
	onWriteReview?: () => void;
}

const sortOptions: SortOption[] = [
	{ value: 'Newest', label: 'Сначала новые' },
	{ value: 'Oldest', label: 'Сначала старые' },
	{ value: 'BestScore', label: 'По рейтингу' },
	{ value: 'WorstScore', label: 'С низким рейтингом' },
	{ value: 'WeightDesc', label: 'По весу' },
];

const canEditReview = (review: CompanyReview, currentUserId: string): boolean => {
	if (review.authorId !== currentUserId) return false;

	const createdAt = new Date(review.createdAt).getTime();
	const diffMs = Date.now() - createdAt;

	return diffMs <= 5 * 60 * 1000;
};

const toVoteMode = (
	reaction: CurrentUserReactionGatewayEnum | undefined,
): VoteModeGatewayEnum | undefined => {
	return reaction === 'Like' || reaction === 'Dislike' ? reaction : undefined;
};

export const ReviewsSection = ({
	className,
	companyName,
	refreshKey = 0,
	onEditReview,
	onWriteReview,
}: ReviewsSectionProps) => {
	const { id } = useParams<{ id: string }>();
	const [voteRefreshKey, setVoteRefreshKey] = useState(0);
	const [userVotes, setUserVotes] = useState<
		Record<string, CurrentUserReactionGatewayEnum | undefined>
	>({});

	const { reviews, total, loading, loadingMore, error, sort, setSort, hasMore, loadMore } =
		useCompanyReviews({
			companyId: id,
			refreshKey: refreshKey + voteRefreshKey,
		});

	const currentUserId = getCurrentUserId();
	const voteMutation = useVoteReviewMutation();

	const {
		isOpen: isReviewViewOpen,
		selectedReview,
		openReview,
		close: closeReviewView,
	} = useReviewViewModal();

	const reportModal = useReportModal();

	const selectedDisplayedReview = useMemo(() => {
		if (!selectedReview) return null;

		return (
			reviews.find((review) => review.reviewId === selectedReview.reviewId) ?? selectedReview
		);
	}, [reviews, selectedReview]);

	const handleSortChange = (value: ReviewsSortGatewayEnum) => {
		setSort(value);
	};

	const handleVote = useCallback(
		(reviewId: string, mode: VoteModeGatewayEnum) => {
			voteMutation.mutate(
				{ reviewId, mode },
				{
					onSuccess: () => {
						setUserVotes((prev) => ({
							...prev,
							[reviewId]: mode === 'Clear' ? 'None' : mode,
						}));

						setVoteRefreshKey((prev) => prev + 1);
					},
				},
			);
		},
		[voteMutation],
	);

	if (loading) {
		return (
			<section className={[styles.section, className].filter(Boolean).join(' ')}>
				<div className={styles.header}>
					<div className={styles.titleBlock}>
						<h2 className={styles.title}>Отзывы</h2>
						<p className={styles.subtitle}>
							Живые впечатления сотрудников и кандидатов
						</p>
					</div>

					{onWriteReview && (
						<Button variant="primary" size="small" onClick={onWriteReview}>
							Написать отзыв
						</Button>
					)}
				</div>

				<div className={styles.metaRow}>
					<div className={styles.metaPill}>Всего отзывов: 0</div>
					<div className={styles.metaPill}>Показано: 0</div>
					<div className={styles.sort}>
						<Select
							value={sort}
							onChange={(value) => handleSortChange(value as ReviewsSortGatewayEnum)}
							options={sortOptions}
						/>
					</div>
				</div>

				<div className={styles.loading}>Загрузка отзывов...</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className={[styles.section, className].filter(Boolean).join(' ')}>
				<div className={styles.error}>Ошибка загрузки отзывов</div>
			</section>
		);
	}

	return (
		<>
			<section className={[styles.section, className].filter(Boolean).join(' ')}>
				<div className={styles.header}>
					<div className={styles.titleBlock}>
						<h2 className={styles.title}>Отзывы</h2>
						<p className={styles.subtitle}>
							Живые впечатления сотрудников и кандидатов
						</p>
					</div>

					{onWriteReview && (
						<Button variant="primary" size="small" onClick={onWriteReview}>
							Написать отзыв
						</Button>
					)}
				</div>

				<div className={styles.metaRow}>
					<div className={styles.metaPill}>Всего отзывов: {total}</div>
					<div className={styles.metaPill}>Показано: {reviews.length}</div>
					<div className={styles.sort}>
						<Select
							value={sort}
							onChange={(value) => handleSortChange(value as ReviewsSortGatewayEnum)}
							options={sortOptions}
						/>
					</div>
				</div>

				<div className={styles.reviewsList}>
					{reviews.length > 0 ? (
						reviews.map((review) => {
							const currentVote = toVoteMode(
								userVotes[review.reviewId] ?? review.currentUserReaction,
							);

							return (
								<ReviewCard
									key={review.reviewId}
									review={review}
									myVote={currentVote}
									onVote={(mode) => handleVote(review.reviewId, mode)}
									isVoting={voteMutation.isPending}
									canManage={canEditReview(review, currentUserId)}
									onEdit={onEditReview}
									onReport={(reviewId) => reportModal.open(reviewId)}
									onClick={() => openReview(review)}
								/>
							);
						})
					) : (
						<p className={styles.empty}>Пока нет отзывов</p>
					)}

					{hasMore && (
						<div className={styles.loadMore}>
							<Button
								onClick={loadMore}
								variant="secondary"
								size="large"
								disabled={loadingMore}
							>
								{loadingMore ? 'Загрузка...' : 'Загрузить ещё'}
							</Button>
						</div>
					)}
				</div>
			</section>

			<ReviewViewModal
				isOpen={isReviewViewOpen}
				review={selectedDisplayedReview}
				companyName={companyName}
				onClose={closeReviewView}
				myVote={
					selectedDisplayedReview
						? toVoteMode(
								userVotes[selectedDisplayedReview.reviewId] ??
									selectedDisplayedReview.currentUserReaction,
							)
						: undefined
				}
				onVote={
					selectedDisplayedReview
						? (mode) => handleVote(selectedDisplayedReview.reviewId, mode)
						: undefined
				}
				isVoting={voteMutation.isPending}
				onReport={(reviewId) => reportModal.open(reviewId)}
			/>

			<ReportModal
				isOpen={reportModal.isOpen}
				reviewId={reportModal.reviewId}
				onClose={reportModal.close}
				reasonType={reportModal.reasonType}
				setReasonType={reportModal.setReasonType}
				reasonText={reportModal.reasonText}
				setReasonText={reportModal.setReasonText}
				isFormValid={reportModal.isFormValid}
				isSubmitting={reportModal.isSubmitting}
				onSubmit={reportModal.submit}
			/>
		</>
	);
};
