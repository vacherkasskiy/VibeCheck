import http from 'shared/api/http';
import type { 
  CreateCompanyReviewRequest,
  UpdateCompanyReviewRequest,
  DeleteCompanyReviewRequest,
  CompanyReviewListResponse,
  ReviewsSortGatewayEnum
} from './reviewTypes';

interface FetchCompanyReviewsParams {
  take?: number;
  pageNum?: number;
  sort?: ReviewsSortGatewayEnum;
}

export const reviewApi = {
  async fetchCompanyReviews(companyId: string, params: FetchCompanyReviewsParams = {}): Promise<CompanyReviewListResponse> {
    const { take = 20, pageNum = 1, sort = 'Newest' } = params;
    const response = await http.get<CompanyReviewListResponse>(`/api/companies/${companyId}/reviews`, {
      take,
      pageNum,
      sort,
    });
    return response.data;
  },

  async createCompanyReview(companyId: string, data: CreateCompanyReviewRequest): Promise<void> {
    await http.post(`/api/companies/${companyId}/reviews`, data);
  },

  async updateCompanyReview(reviewId: string, data: UpdateCompanyReviewRequest): Promise<void> {
    await http.patch(`/api/companies/reviews/${reviewId}`, data);
  },

  async deleteCompanyReview(reviewId: string): Promise<void> {
    await http.delete(`/api/companies/reviews/${reviewId}`, {
      config: { data: { reviewId } satisfies DeleteCompanyReviewRequest },
    });
  },
};
