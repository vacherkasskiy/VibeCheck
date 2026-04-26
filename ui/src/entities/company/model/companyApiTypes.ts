import type { CompanyDTO, CompanyFlag } from './types';

export interface CreateCompanyRequest {
  name: string;
  site?: string;
}

export interface FetchCompaniesResponse {
  items: CompanyDTO[];
  total: number;
}

export interface FetchCompanyFlagsResponse {
  items: CompanyFlag[];
  total: number;
}

