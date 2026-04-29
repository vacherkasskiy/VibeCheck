import http from 'shared/api/http';
import type { 
  CreateCompanyRequest, 
  CreateCompanyResponse,
  FetchCompaniesResponse, 
  FetchCompanyFlagsResponse 
} from './companyApiTypes';
import type { CompanyDTO } from './types';
import type { AxiosResponse } from 'axios';

interface FetchCompaniesParams {
  query?: string;
  take?: number;
  pageNum?: number;
  q?: string;
}

interface FetchCompanyFlagsParams {
  q?: string;
  take?: number;
  pageNum?: number;
}

export const companyApi = {
  async fetchCompanies(params: FetchCompaniesParams): Promise<FetchCompaniesResponse> {
    const { query = '', take = 20, pageNum = 1, q = '' } = params;
    const searchQuery = (query || q).trim();
    
    const response: AxiosResponse<FetchCompaniesResponse> = await http.get('/api/companies', {
      take,
      pageNum,
      ...(searchQuery ? { query: searchQuery, q: searchQuery } : {}),
    });
    return response.data;
  },

  async fetchCompanyById(id: string): Promise<CompanyDTO> {
    const response: AxiosResponse<CompanyDTO> = await http.get(`/api/companies/${id}`);
    return response.data;
  },

  async fetchCompanyFlags(companyId: string, params: FetchCompanyFlagsParams): Promise<FetchCompanyFlagsResponse> {
    const { q = '', take = 50, pageNum = 1 } = params;
    const response: AxiosResponse<FetchCompanyFlagsResponse> = await http.get(`/api/companies/${companyId}/flags`, {
      q,
      take,
      pageNum,
    });
    return response.data;
  },

  async createCompany(params: CreateCompanyRequest): Promise<CreateCompanyResponse> {
    const response: AxiosResponse<CreateCompanyResponse> = await http.post('/api/companies', params);
    return response.data;
  },
};
