import type { CompanyDTO, CompanyFlag } from './types';

export interface CreateCompanyRequest {
  name: string;
  site?: string;
}

export interface FetchCompaniesResponse {
  companies: CompanyDTO[] | null;
  totalCount: number;
}

export interface FetchCompanyFlagsResponse {
  companyId: string;
  flags: CompanyFlag[] | null;
  totalCount: number;
}

export interface CreateCompanyResponse {
  requestId: string | null;
  status: string | null;
  createdAt: string;
}
