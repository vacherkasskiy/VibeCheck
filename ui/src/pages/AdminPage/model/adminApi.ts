import http from 'shared/api/http';
import type {
	AdminCompanyDto,
	AdminFlagDto,
	CreateCompanyRequest,
	CreateFlagRequest,
	GetCompaniesResponse,
	GetCompanyRequestsResponse,
	GetFlagsResponse,
	GetReviewReportsResponse,
	UpdateCompanyRequest,
	UpdateFlagRequest,
} from './types';

interface PaginationParams {
	take?: number;
	pageNum?: number;
}

interface CompaniesParams extends PaginationParams {
	q?: string;
}

interface FlagsParams extends PaginationParams {
	q?: string;
	category?: string;
}

interface CompanyRequestsParams extends PaginationParams {
	q?: string;
	status?: string;
}

interface ReviewReportsParams extends PaginationParams {
	reasonType?: string;
}

export const adminApi = {
	async getCompanies(params: CompaniesParams): Promise<GetCompaniesResponse> {
		const response = await http.get<GetCompaniesResponse>('/api/companies', params);
		return response.data;
	},

	async getCompany(companyId: string): Promise<AdminCompanyDto> {
		const response = await http.get<AdminCompanyDto>(`/api/companies/${companyId}`);
		return response.data;
	},

	async createCompany(payload: CreateCompanyRequest): Promise<AdminCompanyDto> {
		const response = await http.post<AdminCompanyDto>('/api/companies', payload);
		return response.data;
	},

	async updateCompany(companyId: string, payload: UpdateCompanyRequest): Promise<AdminCompanyDto> {
		const response = await http.put<AdminCompanyDto>(`/api/companies/${companyId}`, payload);
		return response.data;
	},

	async deleteCompany(companyId: string): Promise<void> {
		await http.delete(`/api/companies/${companyId}`);
	},

	async getCompanyRequests(params: CompanyRequestsParams): Promise<GetCompanyRequestsResponse> {
		const response = await http.get<GetCompanyRequestsResponse>('/api/company-requests', params);
		return response.data;
	},

	async getFlags(params: FlagsParams): Promise<GetFlagsResponse> {
		const response = await http.get<GetFlagsResponse>('/api/flags', params);
		return response.data;
	},

	async getFlag(flagId: string): Promise<AdminFlagDto> {
		const response = await http.get<AdminFlagDto>(`/api/flags/${flagId}`);
		return response.data;
	},

	async createFlag(payload: CreateFlagRequest): Promise<AdminFlagDto> {
		const response = await http.post<AdminFlagDto>('/api/flags', payload);
		return response.data;
	},

	async updateFlag(flagId: string, payload: UpdateFlagRequest): Promise<AdminFlagDto> {
		const response = await http.put<AdminFlagDto>(`/api/flags/${flagId}`, payload);
		return response.data;
	},

	async deleteFlag(flagId: string): Promise<void> {
		await http.delete(`/api/flags/${flagId}`);
	},

	async getReviewReports(params: ReviewReportsParams): Promise<GetReviewReportsResponse> {
		const response = await http.get<GetReviewReportsResponse>('/api/review-reports', params);
		return response.data;
	},

	async deleteReview(reviewId: string): Promise<void> {
		await http.delete(`/api/reviews/${reviewId}`);
	},
};
