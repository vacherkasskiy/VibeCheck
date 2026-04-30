import { ReviewCard } from 'entities/company';
import { useState, useMemo } from 'react';
import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';
import { Select } from 'shared/ui/Select';
import styles from './ReviewsSection.module.css';
import type { CompanyReview } from 'entities/company';

interface ReviewsSectionProps {
	reviews: CompanyReview[];
}

type SortOption = 'newest' | 'oldest' | 'bestScore' | 'worstScore';

const VISIBLE_REVIEWS_COUNT = 3;

export const ReviewsSection = ({ reviews }: ReviewsSectionProps) => {
	const [sortBy, setSortBy] = useState<SortOption>('newest');
	const [isModalOpen, setIsModalOpen] = useState(false);

	const sortedReviews = useMemo(() => {
		const sorted = [...reviews];
		switch (sortBy) {
			case 'newest':
				return sorted.sort(
					(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				);
			case 'oldest':
				return sorted.sort(
					(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
				);
			case 'bestScore':
				return sorted.sort((a, b) => b.score - a.score);
			case 'worstScore':
				return sorted.sort((a, b) => a.score - b.score);
			default:
				return sorted;
		}
	}, [reviews, sortBy]);

	const visibleReviews = useMemo(() => {
		return sortedReviews.slice(0, VISIBLE_REVIEWS_COUNT);
	}, [sortedReviews]);

	const hasMoreReviews = reviews.length > VISIBLE_REVIEWS_COUNT;

	const sortOptions = [
		{ value: 'newest', label: 'Сначала новые' },
		{ value: 'oldest', label: 'Сначала старые' },
		{ value: 'bestScore', label: 'По рейтингу' },
		{ value: 'worstScore', label: 'С низким рейтингом' },
	];

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	return (
		<>
			<section className={styles.section}>
				<div className={styles.header}>
					<h2 className={styles.title}>Отзывы</h2>
					<div className={styles.headerControls}>
						<div className={styles.sort}>
							<Select
								value={sortBy}
								onChange={(value) => setSortBy(value as SortOption)}
								options={sortOptions}
							/>
						</div>
						{hasMoreReviews && (
							<Button
								variant="secondary"
								size="small"
								onClick={openModal}
								className={styles.viewAllButton}
							>
								Посмотреть все
							</Button>
						)}
					</div>
				</div>

				<div className={styles.reviewsList}>
					{visibleReviews.length > 0 ? (
						visibleReviews.map((review) => (
							<ReviewCard key={review.reviewId} review={review} />
						))
					) : (
						<p className={styles.empty}>Пока нет отзывов</p>
					)}
				</div>
			</section>

			<Modal isOpen={isModalOpen} onClose={closeModal} className={styles.modal}>
				<div className={styles.modalContent}>
					<div className={styles.modalHeader}>
						<h2 className={styles.modalTitle}>Все отзывы ({reviews.length})</h2>
						<div className={styles.modalControls}>
							<div className={styles.sort}>
								<Select
									value={sortBy}
									onChange={(value) => setSortBy(value as SortOption)}
									options={sortOptions}
								/>
							</div>
							<button
								className={styles.closeButton}
								onClick={closeModal}
								aria-label="Закрыть"
							>
								×
							</button>
						</div>
					</div>

					<div className={styles.modalReviewsList}>
						{sortedReviews.length > 0 ? (
							sortedReviews.map((review) => (
								<ReviewCard key={review.reviewId} review={review} />
							))
						) : (
							<p className={styles.empty}>Пока нет отзывов</p>
						)}
					</div>
				</div>
			</Modal>
		</>
	);
};
