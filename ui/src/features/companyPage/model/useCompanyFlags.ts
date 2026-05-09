import { companyApi } from 'entities/company';
import { useMemo, useState } from 'react';
import { mockCompanies } from 'shared/model/mockCompanies';
import { TEST_COMPANY_FLAGS_MOCK, TEST_COMPANY_MOCK } from 'shared/model/mockCompanyForTest';
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

  const fallback = useMemo(() => {
    if (!companyId) return { flags: [], total: 0 };

    const fallbackFlags =
      companyId === TEST_COMPANY_MOCK.companyId
        ? TEST_COMPANY_FLAGS_MOCK
        : mockCompanies.find((company) => company.companyId === companyId)?.topFlags ?? [];

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredFlags = normalizedQuery
      ? fallbackFlags.filter((flag) =>
          (flag.name ?? '').toLowerCase().includes(normalizedQuery),
        )
      : fallbackFlags;

    return {
      flags: filteredFlags.slice(0, initialTake),
      total: filteredFlags.length,
    };
  }, [companyId, initialTake, searchQuery]);

  const shouldUseFallback = !!error && !data;

  return {
    flags: shouldUseFallback ? fallback.flags : data?.flags ?? [],
    total: shouldUseFallback ? fallback.total : data?.totalCount ?? 0,
    loading: isLoading && !shouldUseFallback,
    error: shouldUseFallback ? null : error instanceof Error ? error.message : null,
    searchQuery,
    setSearchQuery,
  };
};
