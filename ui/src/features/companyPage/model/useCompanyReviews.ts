import useSWRInfinite from 'swr/infinite';
import { reviewApi } from 'entities/company';
import { useCallback, useEffect, useMemo } from 'react';
import { useCompanyReviewStore } from './reviewStore';
import type { ReviewsSortGatewayEnum, CompanyReview } from 'entities/company';

interface UseCompanyReviewsProps {
  companyId: string | undefined;
  refreshKey?: number;
}

interface UseCompanyReviewsResult {
  reviews: CompanyReview[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  sort: ReviewsSortGatewayEnum;
  setSort: (sort: ReviewsSortGatewayEnum) => Promise<void>;
  take: number;
  pageNum: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const TAKE = 20;

const buildMockReviews = (targetCompanyId: string): CompanyReview[] => {
  const baseDate = new Date('2026-01-18T12:00:00Z').getTime();

  return [
    {
      weight: 0.94,
      reviewId: `${targetCompanyId}-mock-review-1`,
      authorId: '00000000-0000-0000-0000-000000000101',
      iconId: null,
      text: 'Хороший темп работы и сильная команда. Есть ощущение, что твой вклад реально влияет на продукт.',
      score: 7,
      createdAt: new Date(baseDate).toISOString(),
      flags: [
        { id: 'flag-team', name: 'Сильная команда' },
        { id: 'flag-growth', name: 'Профессиональный рост' },
      ],
    },
    {
      weight: 0.81,
      reviewId: `${targetCompanyId}-mock-review-2`,
      authorId: '00000000-0000-0000-0000-000000000102',
      iconId: null,
      text: 'Процессы местами тяжеловаты, но задачи интересные и масштаб продукта это компенсирует.',
      score: 2,
      createdAt: new Date(baseDate - 1000 * 60 * 60 * 24 * 5).toISOString(),
      flags: [
        { id: 'flag-scale', name: 'Интересный масштаб' },
        { id: 'flag-process', name: 'Сложные процессы' },
      ],
    },
    {
      weight: 0.67,
      reviewId: `${targetCompanyId}-mock-review-3`,
      authorId: '00000000-0000-0000-0000-000000000103',
      iconId: null,
      text: 'Команда приятная, но временами слишком высокий темп и плавающие приоритеты.',
      score: -3,
      createdAt: new Date(baseDate - 1000 * 60 * 60 * 24 * 11).toISOString(),
      flags: [
        { id: 'flag-team', name: 'Команда' },
        { id: 'flag-speed', name: 'Высокий темп' },
      ],
    },
  ];
};

const sortMockReviews = (
  reviews: CompanyReview[],
  sort: ReviewsSortGatewayEnum,
): CompanyReview[] => {
  return [...reviews].sort((left, right) => {
    switch (sort) {
      case 'Newest':
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      case 'Oldest':
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      case 'BestScore':
        return right.score - left.score;
      case 'WorstScore':
        return left.score - right.score;
      case 'WeightAsc':
        return left.weight - right.weight;
      case 'WeightDesc':
      default:
        return right.weight - left.weight;
    }
  });
};

export const useCompanyReviews = ({
  companyId,
  refreshKey = 0,
}: UseCompanyReviewsProps): UseCompanyReviewsResult => {
  const sort = useCompanyReviewStore(
    useCallback(
      (state) =>
        (companyId && state.sortByCompanyId[companyId]) || 'Newest',
      [companyId],
    ),
  );
  const setStoredSort = useCompanyReviewStore((state) => state.setSort);

  const {
    data,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (!companyId) return null;
      if (previousPageData && (previousPageData.reviews ?? []).length === 0) {
        return null;
      }

      return ['company-reviews', companyId, sort, pageIndex + 1, TAKE] as const;
    },
    async ([, id, nextSort, pageNum, take]) =>
      reviewApi.fetchCompanyReviews(id, {
        take,
        pageNum,
        sort: nextSort,
      }),
    {
      revalidateFirstPage: false,
    },
  );

  useEffect(() => {
    void setSize(1);
  }, [companyId, sort, setSize]);

  useEffect(() => {
    if (refreshKey > 0) {
      void mutate();
    }
  }, [mutate, refreshKey]);

  const mockPages = useMemo(() => {
    if (!companyId) return [];

    const sortedMockReviews = sortMockReviews(buildMockReviews(companyId), sort);
    const pages = [];

    for (let index = 0; index < sortedMockReviews.length; index += TAKE) {
      pages.push({
        reviews: sortedMockReviews.slice(index, index + TAKE),
        totalCount: sortedMockReviews.length,
      });
    }

    return pages;
  }, [companyId, sort]);

  const pages = data?.length ? data : error ? mockPages : [];
  const reviews = pages.flatMap((page) => page.reviews ?? []);
  const total = pages[0]?.totalCount ?? 0;
  const hasMore = reviews.length < total;
  const loading = (isLoading || (!data && isValidating)) && pages.length === 0;
  const loadingMore = isValidating && pages.length > 0;

  const loadMore = async (): Promise<void> => {
    if (!companyId || loading || loadingMore || !hasMore) return;
    await setSize((currentSize) => currentSize + 1);
  };

  const refresh = async (): Promise<void> => {
    await mutate();
  };

  const setSort = async (nextSort: ReviewsSortGatewayEnum): Promise<void> => {
    if (!companyId) return;

    setStoredSort(companyId, nextSort);
    await setSize(1);
  };

  return {
    reviews,
    total,
    loading,
    loadingMore,
    error: data || !error ? null : error instanceof Error ? error.message : 'Failed to load reviews',
    sort,
    setSort,
    take: TAKE,
    pageNum: size,
    hasMore,
    loadMore,
    refresh,
  };
};
