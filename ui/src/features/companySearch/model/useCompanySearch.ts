import { companyApi } from 'entities/company';
import { useEffect, useMemo, useState } from 'react';
import { mockCompanies } from 'shared/model/mockCompanies';
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
}

const getMockCompanies = (query: string): { items: CompanyDTO[]; total: number } => {
  const normalizedQuery = query.trim().toLowerCase();

  const filteredCompanies = mockCompanies.filter((company) => {
    if (!normalizedQuery) return true;

    const haystack = [
      company.name ?? '',
      company.description ?? '',
      ...(company.topFlags ?? []).map((flag) => flag.name ?? ''),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const sortedCompanies = [...filteredCompanies].sort(
    (left, right) => (right.weight ?? 0) - (left.weight ?? 0),
  );

  return {
    items: sortedCompanies,
    total: sortedCompanies.length,
  };
};

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

  const mockResult = useMemo(() => getMockCompanies(debouncedQuery), [debouncedQuery]);
  const shouldUseMock = !!error && liveItems.length === 0;

  const items = shouldUseMock ? mockResult.items.slice(0, size * COMPANIES_PAGE_SIZE) : liveItems;
  const total = shouldUseMock ? mockResult.total : liveTotal;
  const hasMore = items.length < total;
  const pending = shouldUseMock ? false : (isLoading || isValidating) && items.length === 0;

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
  };
};
