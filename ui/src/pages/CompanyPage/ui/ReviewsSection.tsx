import { useCompanyReviews } from 'features/companyPage';
import { useState, useMemo } from 'react';
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
  const { 
    reviews, 
    total, 
    loading, 
    error, 
    sort, 
    setSort, 
    hasMore, 
    loadMore 
  } = useCompanyReviews({ companyId: 'test-company-001' }); 

  const [localSort, setLocalSort] = useState<ReviewsSortGatewayEnum>('CREATED_AT_DESC');

  const sortOptions: SortOption[] = [
    { value: 'CREATED_AT_DESC', label: 'Сначала новые' },
    { value: 'CREATED_AT_ASC', label: 'Сначала старые' },
    { value: 'LIKES_DESC', label: 'По лайкам' },
    { value: 'DISLIKES_DESC', label: 'По дизлайкам' },
  ];

  const sortedReviews = useMemo(() => {
    return reviews.sort((a, b) => {
      switch (localSort) {
        case 'CREATED_AT_DESC':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'CREATED_AT_ASC':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'LIKES_DESC':
          return b.reactions.likes - a.reactions.likes;
        case 'DISLIKES_DESC':
          return b.reactions.dislikes - a.reactions.dislikes;
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
          sortedReviews.map((review) => <ReviewCard key={review.id} review={review} />)
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

