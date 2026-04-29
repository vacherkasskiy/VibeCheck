import { useCompanyReviews } from 'features/companyPage';
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from 'shared/ui/Button';
import { Select } from 'shared/ui/Select';
import { ReviewCard } from './ReviewCard';
import styles from './ReviewsSection.module.css';
import type { CompanyReview, ReviewsSortGatewayEnum } from 'entities/company';

type SortOption = {
	value: ReviewsSortGatewayEnum;
	label: string;
};

export const ReviewsSection = () => {
	const { id } = useParams<{ id: string }>();
	const { reviews, total, loading, error, sort, setSort, hasMore, loadMore } = useCompanyReviews({
		companyId: id,
	});

	const [localSort, setLocalSort] = useState<ReviewsSortGatewayEnum>('Newest');

	const sortOptions: SortOption[] = [
		{ value: 'Newest', label: 'Сначала новые' },
		{ value: 'Oldest', label: 'Сначала старые' },
		{ value: 'BestScore', label: 'По рейтингу' },
		{ value: 'WorstScore', label: 'С низким рейтингом' },
		{ value: 'WeightDesc', label: 'По весу' },
	];

	const sortedReviews = useMemo(() => {
		return [...reviews].sort((a, b) => {
			switch (localSort) {
				case 'Newest':
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				case 'Oldest':
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				case 'BestScore':
					return b.score - a.score;
				case 'WorstScore':
					return a.score - b.score;
				case 'WeightDesc':
					return b.weight - a.weight;
				case 'WeightAsc':
					return a.weight - b.weight;
				default:
					return 0;
			}
		});
	}, [reviews, localSort]);

	const handleSortChange = (value: ReviewsSortGatewayEnum) => {
		setLocalSort(value);
		setSort(value);
	};

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
		<section className={styles.section}>
			<div className={styles.header}>
				<h2 className={styles.title}>Отзывы ({total})</h2>
				<div className={styles.sort}>
					<Select
						value={localSort}
						onChange={(value) => handleSortChange(value as ReviewsSortGatewayEnum)}
						options={sortOptions}
					/>
				</div>
			</div>

			<div className={styles.reviewsList}>
				{sortedReviews.length > 0 ? (
					sortedReviews.map((review) => <ReviewCard key={review.reviewId} review={review} />)
				) : (
					<p className={styles.empty}>Пока нет отзывов</p>
				)}
				{hasMore && (
					<div className={styles.loadMore}>
						<Button onClick={loadMore} variant="secondary" size="large">
							Загрузить ещё
						</Button>
					</div>
				)}
			</div>
		</section>
	);
};
