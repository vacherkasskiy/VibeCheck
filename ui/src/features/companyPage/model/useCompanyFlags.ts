import { companyApi } from 'entities/company';
import { useState } from 'react';
import useSWR from 'swr';
import type { CompanyFlag } from 'entities/company';

interface UseCompanyFlagsResult {
  flags: CompanyFlag[];
  total: number;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useCompanyFlags = (companyId: string | undefined, initialTake = 20): UseCompanyFlagsResult => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, error, isLoading } = useSWR(
    companyId ? ['company-flags', companyId, searchQuery, initialTake] : null,
    async ([, id, query, take]: readonly [string, string, string, number]) =>
      companyApi.fetchCompanyFlags(id, {
        q: query || undefined,
        take,
        pageNum: 1,
      }),
  );

  return {
    flags: data?.flags ?? [],
    total: data?.totalCount ?? 0,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    searchQuery,
    setSearchQuery,
  };
};
