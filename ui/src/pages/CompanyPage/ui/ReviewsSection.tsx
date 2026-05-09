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
import type { CompanyReview, ReviewsSortGatewayEnum, VoteModeGatewayEnum } from 'entities/company';

type SortOption = {
	value: ReviewsSortGatewayEnum;
	label: string;
};

interface ReviewsSectionProps {
	refreshKey?: number;
	onEditReview?: (review: CompanyReview) => void;
}

const sortOptions: SortOption[] = [
	{ value: 'Newest', label: 'Сначала новые' },
	{ value: 'Oldest', label: 'Сначала старые' },
	{ value: 'BestScore', label: 'По рейтингу' },
	{ value: 'WorstScore', label: 'С низким рейтингом' },
	{ value: 'WeightDesc', label: 'По весу' },
];

const getScoreDelta = (
	previousVote: VoteModeGatewayEnum | undefined,
	nextVote: VoteModeGatewayEnum,
): number => {
	if (previousVote === nextVote) return 0;
	if (!previousVote) return nextVote === 'Like' ? 1 : nextVote === 'Dislike' ? -1 : 0;
	if (previousVote === 'Like') return nextVote === 'Dislike' ? -2 : -1;
	if (previousVote === 'Dislike') return nextVote === 'Like' ? 2 : 1;
	return 0;
};

const canEditReview = (review: CompanyReview, currentUserId: string): boolean => {
	if (review.authorId !== currentUserId) return false;

	const createdAt = new Date(review.createdAt).getTime();
	const diffMs = Date.now() - createdAt;
	return diffMs <= 5 * 60 * 1000;
};

export const ReviewsSection = ({ refreshKey = 0, onEditReview }: ReviewsSectionProps) => {
	const { id } = useParams<{ id: string }>();
	const { reviews, total, loading, loadingMore, error, sort, setSort, hasMore, loadMore } =
		useCompanyReviews({
			companyId: id,
			refreshKey,
		});
	const currentUserId = getCurrentUserId();

	const voteMutation = useVoteReviewMutation();
	const [userVotes, setUserVotes] = useState<Record<string, VoteModeGatewayEnum>>({});
	const [scoreAdjustments, setScoreAdjustments] = useState<Record<string, number>>({});

	const {
		isOpen: isReviewViewOpen,
		selectedReview,
		openReview,
		close: closeReviewView,
	} = useReviewViewModal();

	const reportModal = useReportModal();

	const displayedReviews = useMemo(
		() =>
			reviews.map((review) => ({
				...review,
				score: review.score + (scoreAdjustments[review.reviewId] ?? 0),
			})),
		[reviews, scoreAdjustments],
	);

	const selectedDisplayedReview = useMemo(() => {
		if (!selectedReview) return null;
		return displayedReviews.find((review) => review.reviewId === selectedReview.reviewId) ?? selectedReview;
	}, [displayedReviews, selectedReview]);

	const handleSortChange = (value: ReviewsSortGatewayEnum) => {
		setSort(value);
	};

	const handleVote = useCallback(
		(reviewId: string, mode: VoteModeGatewayEnum) => {
			const previousVote = userVotes[reviewId];
			const delta = getScoreDelta(previousVote, mode);

			setUserVotes((prev) => ({
				...prev,
				[reviewId]: mode,
			}));

			setScoreAdjustments((prev) => ({
				...prev,
				[reviewId]: (prev[reviewId] ?? 0) + delta,
			}));

			voteMutation.mutate(
				{ reviewId, mode },
				{
					onError: () => {
						setUserVotes((prev) => {
							const nextVotes = { ...prev };
							if (previousVote) {
								nextVotes[reviewId] = previousVote;
							} else {
								delete nextVotes[reviewId];
							}
							return nextVotes;
						});

						setScoreAdjustments((prev) => ({
							...prev,
							[reviewId]: (prev[reviewId] ?? 0) - delta,
						}));
					},
				},
			);
		},
		[userVotes, voteMutation],
	);

	if (loading) {
		return (
			<section className={styles.section}>
				<div className={styles.loading}>Загрузка отзывов...</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className={styles.section}>
				<div className={styles.error}>Ошибка загрузки отзывов</div>
			</section>
		);
	}

	return (
		<>
			<section className={styles.section}>
				<div className={styles.header}>
					<div className={styles.titleBlock}>
						<h2 className={styles.title}>Отзывы</h2>
						<p className={styles.subtitle}>
							Живые впечатления сотрудников и кандидатов
						</p>
					</div>
					<div className={styles.sort}>
						<Select
							value={sort}
							onChange={(value) => handleSortChange(value as ReviewsSortGatewayEnum)}
							options={sortOptions}
						/>
					</div>
				</div>

				<div className={styles.metaRow}>
					<div className={styles.metaPill}>Всего отзывов: {total}</div>
					<div className={styles.metaPill}>Показано: {displayedReviews.length}</div>
					<div className={styles.metaPill}>
						Режим: {sortOptions.find((option) => option.value === sort)?.label}
					</div>
				</div>

				<div className={styles.reviewsList}>
					{displayedReviews.length > 0 ? (
						displayedReviews.map((review) => (
							<ReviewCard
								key={review.reviewId}
								review={review}
								myVote={userVotes[review.reviewId]}
								onVote={(mode) => handleVote(review.reviewId, mode)}
								isVoting={voteMutation.isPending}
								canManage={canEditReview(review, currentUserId)}
								onEdit={onEditReview}
								onReport={(reviewId) => reportModal.open(reviewId)}
								onClick={() => openReview(review)}
							/>
						))
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
				onClose={closeReviewView}
				myVote={selectedDisplayedReview ? userVotes[selectedDisplayedReview.reviewId] : undefined}
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
