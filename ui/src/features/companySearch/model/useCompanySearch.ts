import { companyApi } from 'entities/company';
import { useEffect, useMemo, useState } from 'react';
import { ApiError } from 'shared/api/types';
import useSWRInfinite from 'swr/infinite';
import { useCompanySearchStore } from './store';
import type { CompanyDTO } from 'entities/company';

const COMPANIES_PAGE_SIZE = 10;

interface UseCompanySearchResult {
  query: string;
  setQuery: (query: string) => void;
  items: CompanyDTO[];
  total: number;
  pending: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  error: ApiError | null;
}

export const useCompanySearch = (): UseCompanySearchResult => {
  const query = useCompanySearchStore((state) => state.query);
  const setQuery = useCompanySearchStore((state) => state.setQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, query.trim() ? 300 : 0);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const {
    data,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (previousPageData && (previousPageData.companies ?? []).length === 0) {
        return null;
      }

      return ['companies', debouncedQuery, pageIndex + 1, COMPANIES_PAGE_SIZE] as const;
    },
    async ([, searchQuery, pageNum, take]) =>
      companyApi.fetchCompanies({
        query: searchQuery,
        q: searchQuery,
        pageNum,
        take,
      }),
    {
      revalidateFirstPage: false,
    },
  );

  useEffect(() => {
    void setSize(1);
  }, [debouncedQuery, setSize]);

  const liveItems = useMemo(
    () => (data ?? []).flatMap((page) => page.companies ?? []),
    [data],
  );
  const liveTotal = data?.[0]?.totalCount ?? 0;

  const normalizedError = error instanceof ApiError ? error : null;
  const items = liveItems;
  const total = liveTotal;
  const hasMore = items.length < total;
  const pending = (isLoading || isValidating) && items.length === 0;

  const loadMore = async (): Promise<void> => {
    if (pending || isValidating || !hasMore) return;
    await setSize((currentSize) => currentSize + 1);
  };

  return {
    query,
    setQuery,
    items,
    total,
    pending,
    hasMore,
    loadMore,
    error: normalizedError,
  };
};
