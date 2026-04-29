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

  useEffect(() => {
    if (!companyId) return;

    let ignore = false;

    const loadFirstPage = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await reviewApi.fetchCompanyReviews(companyId, {
          take,
          pageNum: 1,
          sort,
        });

        if (ignore) return;

        setReviews(response.reviews ?? []);
        setTotal(response.totalCount);
        setPageNum(1);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load reviews');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadFirstPage();

    return () => {
      ignore = true;
    };
  }, [companyId, sort, take]);

  const loadMore = useCallback(async () => {
    if (!companyId || !hasMore || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextPage = pageNum + 1;
      const response = await reviewApi.fetchCompanyReviews(companyId, {
        take,
        pageNum: nextPage,
        sort,
      });

      setReviews((prev) => [...prev, ...(response.reviews ?? [])]);
      setTotal(response.totalCount);
      setPageNum(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [companyId, hasMore, loading, pageNum, sort, take]);

  const setNewSort = async (newSort: ReviewsSortGatewayEnum): Promise<void> => {
    setSort(newSort);
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
