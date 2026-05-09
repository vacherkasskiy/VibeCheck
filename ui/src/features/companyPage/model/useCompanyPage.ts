import { companyApi } from 'entities/company';
import { useMemo } from 'react';
import { mockCompanies } from 'shared/model/mockCompanies';
import { TEST_COMPANY_MOCK } from 'shared/model/mockCompanyForTest';
import useSWR from 'swr';
import type { CompanyDTO } from 'entities/company';

interface UseCompanyPageResult {
  company: CompanyDTO | null;
  loading: boolean;
  error: string | null;
}

export const useCompanyPage = (id: string | undefined): UseCompanyPageResult => {
  const { data, error, isLoading } = useSWR(
    id ? ['company', id] : null,
    async ([, companyId]: readonly [string, string]) => companyApi.fetchCompanyById(companyId),
  );

  const fallbackCompany = useMemo(() => {
    if (!id) return null;

    return (
      mockCompanies.find((company) => company.companyId === id) ||
      (id === TEST_COMPANY_MOCK.companyId ? TEST_COMPANY_MOCK : null)
    );
  }, [id]);

  if (!id) {
    return {
      company: null,
      loading: false,
      error: 'Company ID is required',
    };
  }

  return {
    company: data ?? fallbackCompany,
    loading: isLoading && !fallbackCompany,
    error: data || fallbackCompany ? null : error instanceof Error ? error.message : 'Failed to load company',
  };
};
