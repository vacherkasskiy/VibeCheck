import { companyApi } from 'entities/company';
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

  if (!id) {
    return {
      company: null,
      loading: false,
      error: 'Company ID is required',
    };
  }

  return {
    company: data ?? null,
    loading: isLoading,
    error: data ? null : error instanceof Error ? error.message : 'Что-то пошло не так. Попробуйте еще раз позже.',
  };
};
