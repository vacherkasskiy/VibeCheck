import http from 'shared/api/http';
import type {
	AdminCompanyDto,
	AdminFlagDto,
	CreateCompanyRequest,
	CreateFlagRequest,
	FlagCategory,
	GetCompaniesResponse,
	GetCompanyRequestsResponse,
	GetFlagsResponse,
	GetReviewReportsResponse,
	UpdateCompanyRequest,
	UpdateFlagRequest,
} from './types';

const ADMIN_API_PREFIX = '/api/admin';

interface PaginationParams {
	take?: number;
	pageNum?: number;
}

interface CompaniesParams extends PaginationParams {
	q?: string;
}

interface FlagsParams extends PaginationParams {
	q?: string;
	category?: FlagCategory;
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
		const response = await http.get<GetCompaniesResponse>(`${ADMIN_API_PREFIX}/companies`, params);
		return response.data;
	},

	async getCompany(companyId: string): Promise<AdminCompanyDto> {
		const response = await http.get<AdminCompanyDto>(`${ADMIN_API_PREFIX}/companies/${companyId}`);
		return response.data;
	},

	async createCompany(payload: CreateCompanyRequest): Promise<AdminCompanyDto> {
		const response = await http.post<AdminCompanyDto>(`${ADMIN_API_PREFIX}/companies`, payload);
		return response.data;
	},

	async updateCompany(companyId: string, payload: UpdateCompanyRequest): Promise<AdminCompanyDto> {
		const response = await http.put<AdminCompanyDto>(`${ADMIN_API_PREFIX}/companies/${companyId}`, payload);
		return response.data;
	},

	async deleteCompany(companyId: string): Promise<void> {
		await http.delete(`${ADMIN_API_PREFIX}/companies/${companyId}`);
	},

	async getCompanyRequests(params: CompanyRequestsParams): Promise<GetCompanyRequestsResponse> {
		const response = await http.get<GetCompanyRequestsResponse>(`${ADMIN_API_PREFIX}/company-requests`, params);
		return response.data;
	},

	async getFlags(params: FlagsParams): Promise<GetFlagsResponse> {
		const response = await http.get<GetFlagsResponse>(`${ADMIN_API_PREFIX}/flags`, params);
		return response.data;
	},

	async getFlag(flagId: string): Promise<AdminFlagDto> {
		const response = await http.get<AdminFlagDto>(`${ADMIN_API_PREFIX}/flags/${flagId}`);
		return response.data;
	},

	async createFlag(payload: CreateFlagRequest): Promise<AdminFlagDto> {
		const response = await http.post<AdminFlagDto>(`${ADMIN_API_PREFIX}/flags`, payload);
		return response.data;
	},

	async updateFlag(flagId: string, payload: UpdateFlagRequest): Promise<AdminFlagDto> {
		const response = await http.put<AdminFlagDto>(`${ADMIN_API_PREFIX}/flags/${flagId}`, payload);
		return response.data;
	},

	async deleteFlag(flagId: string): Promise<void> {
		await http.delete(`${ADMIN_API_PREFIX}/flags/${flagId}`);
	},

	async getReviewReports(params: ReviewReportsParams): Promise<GetReviewReportsResponse> {
		const response = await http.get<GetReviewReportsResponse>(`${ADMIN_API_PREFIX}/review-reports`, params);
		return response.data;
	},

	async deleteReview(reviewId: string): Promise<void> {
		await http.delete(`${ADMIN_API_PREFIX}/reviews/${reviewId}`);
	},
};
