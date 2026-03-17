import { companyApi } from 'entities/company';
import { useEffect, useState } from 'react';
import type { CompanyDTO } from 'entities/company';

interface UseCompanyPageResult {
  company: CompanyDTO | null;
  loading: boolean;
  error: string | null;
}

export const useCompanyPage = (id: string | undefined): UseCompanyPageResult => {
  const [company, setCompany] = useState<CompanyDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Company ID is required');
      return;
    }

    const loadCompany = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await companyApi.fetchCompanyById(id);
        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load company');
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [id]);

  return { company, loading, error };
};
