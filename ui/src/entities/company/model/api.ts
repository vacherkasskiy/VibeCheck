import { mockCompanies } from 'shared/model/mockCompanies';
import type { CompanyDTO } from './types';

interface FetchCompaniesParams {
  q?: string;
  offset?: number;
  limit?: number;
}

interface FetchCompaniesResponse {
  items: CompanyDTO[];
  total: number;
}

interface CreateCompanyParams {
  name: string;
  description: string;
}

export const companyApi = {
  async fetchCompanies(params: FetchCompaniesParams): Promise<FetchCompaniesResponse> {
    const response = await mockCompanies.fetchCompanies(params);
    
    if (response.ok) {
      return response.data;
    }
    
    throw new Error('Failed to fetch companies');
  },

  async fetchCompanyById(id: string): Promise<CompanyDTO> {
    const response = await mockCompanies.fetchCompanyById(id);
    
    if (response.ok) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch company');
  },

  async createCompany(params: CreateCompanyParams): Promise<CompanyDTO> {
    // Mock implementation - replace with real API call
    const newCompany: CompanyDTO = {
      id: `company-${Date.now()}`,
      name: params.name,
      description: params.description,
      logoUrl: null,
      topFlags: [],
    };
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return newCompany;
  }
};
