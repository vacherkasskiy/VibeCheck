import { reviewApi } from 'entities/company';
import { useCallback, useEffect, useState } from 'react';
import type { ReviewsSortGatewayEnum, CompanyReview } from 'entities/company';

interface UseCompanyReviewsProps {
  companyId: string | undefined;
}

interface UseCompanyReviewsResult {
  reviews: CompanyReview[];
  total: number;
  loading: boolean;
  error: string | null;
  sort: ReviewsSortGatewayEnum;
  setSort: (sort: ReviewsSortGatewayEnum) => Promise<void>;
  take: number;
  pageNum: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const useCompanyReviews = ({ companyId }: UseCompanyReviewsProps): UseCompanyReviewsResult => {
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<ReviewsSortGatewayEnum>('Newest');
  const [pageNum, setPageNum] = useState(1);
  const take = 20;
  const hasMore = reviews.length < total;

  const loadReviews = useCallback(async (append = false, newSort?: ReviewsSortGatewayEnum) => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await reviewApi.fetchCompanyReviews(companyId, {
        take,
        pageNum: append ? pageNum + 1 : 1,
        sort: newSort || sort,
      });
      
      const nextReviews = response.reviews ?? [];
      setReviews(append ? [...reviews, ...nextReviews] : nextReviews);
      setTotal(response.totalCount);
      if (!append) setPageNum(1);
      else setPageNum(pageNum + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [companyId, sort, pageNum, reviews, total, take]);

  useEffect(() => {
    loadReviews(false);
  }, [companyId, sort, loadReviews]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await loadReviews(true);
    }
  }, [hasMore, loading, loadReviews]);

  const setNewSort = async (newSort: ReviewsSortGatewayEnum): Promise<void> => {
    setSort(newSort);
    await loadReviews(false, newSort);
  };

  return {
    reviews,
    total,
    loading,
    error,
    sort,
    setSort: setNewSort,
    take,
    pageNum,
    hasMore,
    loadMore,
  };
};

