import { companyApi } from 'entities/company';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CompanyDTO } from 'entities/company';

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
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (reset = false) => {
      setPending(true);
      try {
        const response = await companyApi.fetchCompanies({
          q: query,
          take: 10,
          pageNum: 1,
        });
        
        setTotal(response.total);
        
        if (reset) {
          setItems(response.items);
          setOffset(10);
          setHasMore(response.items.length < response.total);
        } else {
          setItems((prev) => [...prev, ...response.items]);
          setOffset((prev) => prev + response.items.length);
          setHasMore(offset + response.items.length < response.total);
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      } finally {
        setPending(false);
      }
    },
    [query, offset]
  );

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load(true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, load]);

  const loadMore = useCallback(async () => {
    if (!pending && hasMore) {
      await load(false);
    }
  }, [pending, hasMore, load]);

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
