import { companyApi } from 'entities/company';
import { useCallback, useEffect, useRef, useState } from 'react';
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

export const useCompanySearch = (): UseCompanySearchResult => {
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(false);
  const [items, setItems] = useState<CompanyDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedCountRef = useRef(0);
  const requestIdRef = useRef(0);

  const loadPage = useCallback(
    async (pageNum: number, reset = false) => {
      const requestId = ++requestIdRef.current;
      setPending(true);

      try {
        const response = await companyApi.fetchCompanies({
          q: query.trim(),
          take: COMPANIES_PAGE_SIZE,
          pageNum,
        });

        if (requestId !== requestIdRef.current) return;
        
        const nextItems = response.companies ?? [];
        setTotal(response.totalCount);
        setPage(pageNum);
        
        if (reset) {
          setItems(nextItems);
          loadedCountRef.current = nextItems.length;
        } else {
          setItems((prev) => [...prev, ...nextItems]);
          loadedCountRef.current += nextItems.length;
        }

        setHasMore(loadedCountRef.current < response.totalCount);
      } catch (error) {
        console.error('Failed to fetch companies:', error);
        if (requestId === requestIdRef.current && reset) {
          setItems([]);
          setTotal(0);
          setHasMore(false);
          loadedCountRef.current = 0;
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setPending(false);
        }
      }
    },
    [query]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void loadPage(1, true);
    }, query.trim() ? 300 : 0);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, loadPage]);

  const loadMore = useCallback(async () => {
    if (!pending && hasMore) {
      await loadPage(page + 1, false);
    }
  }, [pending, hasMore, page, loadPage]);

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
