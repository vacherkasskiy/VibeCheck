import { useState, useMemo } from 'react';
import React from 'react';
import { Select } from 'shared/ui/Select';
import { ReviewCard } from './ReviewCard';
import styles from './ReviewsSection.module.css';
import type { CompanyReview } from 'entities/company';

interface ReviewsSectionProps {
	reviews: CompanyReview[];
}

type SortOption = 'newest' | 'oldest' | 'likes' | 'dislikes';

export const ReviewsSection = ({ reviews }: ReviewsSectionProps) => {
	const [sortBy, setSortBy] = useState<SortOption>('newest');

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
			case 'likes':
				return sorted.sort((a, b) => b.reactions.likes - a.reactions.likes);
			case 'dislikes':
				return sorted.sort((a, b) => b.reactions.dislikes - a.reactions.dislikes);
			default:
				return sorted;
		}
	}, [reviews, sortBy]);

	const sortOptions = [
		{ value: 'newest', label: 'Сначала новые' },
		{ value: 'oldest', label: 'Сначала старые' },
		{ value: 'likes', label: 'По лайкам' },
		{ value: 'dislikes', label: 'По дизлайкам' },
	];

	return (
		<section className={styles.section}>
			<div className={styles.header}>
				<h2 className={styles.title}>Отзывы</h2>
				<div className={styles.sort}>
					<Select
						value={sortBy}
						onChange={(value) => setSortBy(value as SortOption)}
						options={sortOptions}
					/>
				</div>
			</div>

			<div className={styles.reviewsList}>
				{sortedReviews.length > 0 ? (
					sortedReviews.map((review) => <ReviewCard key={review.id} review={review} />)
				) : (
					<p className={styles.empty}>Пока нет отзывов</p>
				)}
			</div>
		</section>
	);
};
