export type FlagCategory =
	| 'Culture'
	| 'Management'
	| 'Processes'
	| 'Communications'
	| 'Image'
	| 'Compensation'
	| 'Career'
	| 'Balance'
	| 'Conditions'
	| 'Values';

export interface ProblemDetails {
	type?: string | null;
	title?: string | null;
	status?: number | null;
	detail?: string | null;
	instance?: string | null;
	[key: string]: unknown;
}

export interface AdminCompanyDto {
	companyId: string;
	name: string | null;
	description?: string | null;
	iconId?: string | null;
	siteUrl?: string | null;
	linkedinUrl?: string | null;
	hrUrl?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AdminFlagDto {
	flagId: string;
	name: string | null;
	category: FlagCategory;
	description: string | null;
	createdAt: string;
}

export interface CompanyRequestDto {
	requestId: string;
	requesterUserId: string;
	name: string | null;
	siteUrl?: string | null;
	status: string | null;
	createdAt: string;
	decidedAt?: string | null;
	decidedByUserId?: string | null;
}

export interface ReviewReportDto {
	reportId: string;
	reviewId: string;
	reporterId: string;
	reasonType: string | null;
	reasonText?: string | null;
	createdAt: string;
	reviewAuthorId: string;
	companyId: string;
	companyName: string | null;
	reviewText?: string | null;
	reviewCreatedAt: string;
	reviewDeletedAt?: string | null;
}

export interface GetCompaniesResponse {
	totalCount: number;
	companies: AdminCompanyDto[] | null;
}

export interface GetFlagsResponse {
	totalCount: number;
	flags: AdminFlagDto[] | null;
}

export interface GetCompanyRequestsResponse {
	totalCount: number;
	requests: CompanyRequestDto[] | null;
}

export interface GetReviewReportsResponse {
	totalCount: number;
	reports: ReviewReportDto[] | null;
}

export interface CreateCompanyRequest {
	name: string | null;
	description?: string | null;
	iconId?: string | null;
	siteUrl?: string | null;
	linkedinUrl?: string | null;
	hrUrl?: string | null;
}

export interface UpdateCompanyRequest extends CreateCompanyRequest {}

export interface CreateFlagRequest {
	name: string | null;
	category: FlagCategory;
	description: string | null;
}

export interface UpdateFlagRequest extends CreateFlagRequest {}
