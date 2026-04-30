import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from 'shared/api/http';
import type { 
  UpdateCompanyReviewRequest,
  DeleteCompanyReviewRequest,
  CompanyReviewListResponse,
  ReviewsSortGatewayEnum,
  VoteModeGatewayEnum,
  ReportReviewRequest
} from './reviewTypes';


import type { CreateCompanyReviewRequest } from './reviewTypes';

interface FetchCompanyReviewsParams {
  take?: number;
  pageNum?: number;
  sort?: ReviewsSortGatewayEnum;
}

export const reviewApi = {
  async voteReview(reviewId: string, mode: VoteModeGatewayEnum): Promise<void> {
    await http.patch(`/api/users/reviews/${reviewId}/vote`, { mode });
  },

  async reportReview(reviewId: string, data: ReportReviewRequest): Promise<void> {
    await http.post(`/api/users/reviews/${reviewId}/report`, data);
  },

  async fetchCompanyReviews(companyId: string, params: FetchCompanyReviewsParams = {}): Promise<CompanyReviewListResponse> {
    const { take = 20, pageNum = 1, sort = 'Newest' } = params;
    const response = await http.get<CompanyReviewListResponse>(`/api/companies/${companyId}/reviews`, {
      params: {
        take,
        pageNum,
        sort,
      },
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
      config: {
        data: { reviewId }
      }
    });
  },
};




export const useCreateCompanyReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: CreateCompanyReviewRequest }) => 
      reviewApi.createCompanyReview(companyId, data),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['CompanyReviews', companyId] });
      queryClient.invalidateQueries({ queryKey: ['UserReviews'] });
    },
  });
};

export const useUpdateCompanyReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: UpdateCompanyReviewRequest }) => 
      reviewApi.updateCompanyReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['UserReviews'] });
      queryClient.invalidateQueries({ queryKey: ['CompanyReviews'] });
    },
  });
};





