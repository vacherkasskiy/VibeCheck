import http from 'shared/api/http';
import type { 
  CreateCompanyReviewRequest,
  UpdateCompanyReviewRequest,
  DeleteCompanyReviewRequest,
  CompanyReviewListResponse,
  ReviewsSortGatewayEnum
} from './reviewTypes';
import type { CompanyReview } from './types';

interface FetchCompanyReviewsParams {
  take?: number;
  pageNum?: number;
  sort?: ReviewsSortGatewayEnum;
}

export const reviewApi = {
  async fetchCompanyReviews(companyId: string, params: FetchCompanyReviewsParams = {}): Promise<CompanyReviewListResponse> {
    const { take = 20, pageNum = 1, sort = 'CREATED_AT_DESC' } = params;
    const response = await http.get<CompanyReviewListResponse>(`/api/companies/${companyId}/reviews`, {
      params: { take, pageNum, sort },
    });
    return response.data;
  },

  async createCompanyReview(companyId: string, data: CreateCompanyReviewRequest): Promise<CompanyReview> {
    const response = await http.post<CompanyReview>(`/api/companies/${companyId}/reviews`, data);
    return response.data;
  },

  async updateCompanyReview(reviewId: string, data: UpdateCompanyReviewRequest): Promise<CompanyReview> {
    const response = await http.patch<CompanyReview>(`/api/companies/reviews/${reviewId}`, data);
    return response.data;
  },

  async deleteCompanyReview(reviewId: string): Promise<void> {
    await http.delete(`/api/companies/reviews/${reviewId}`);
  },
};



