import { companyApi } from 'entities/company';
import { useEffect, useState } from 'react';
import type { CompanyFlag } from 'entities/company';

interface FetchCompanyFlagsParams {
  q?: string;
  take?: number;
  pageNum?: number;
}

interface UseCompanyFlagsResult {
  flags: CompanyFlag[];
  total: number;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useCompanyFlags = (companyId: string | undefined, initialTake = 50): UseCompanyFlagsResult => {
  const [flags, setFlags] = useState<CompanyFlag[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadFlags = async (q: string = '', refresh = false) => {
    if (!companyId) {
      setFlags([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: FetchCompanyFlagsParams = {
        q: q || undefined,
        take: initialTake,
        pageNum: 1,
      };
      const response = await companyApi.fetchCompanyFlags(companyId, params);
      setFlags(response.flags ?? []);
      setTotal(response.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags(searchQuery);
  }, [companyId, searchQuery]);

  return {
    flags,
    total,
    loading,
    error,
    searchQuery,
    setSearchQuery,
  };
};
