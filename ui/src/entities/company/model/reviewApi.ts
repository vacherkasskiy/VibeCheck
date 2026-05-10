import { useMutation } from '@tanstack/react-query';
import http from 'shared/api/http';
import { mutate as mutateCache } from 'swr';
import type {
  UpdateCompanyReviewRequest,
  CompanyReviewListResponse,
  ReviewsSortGatewayEnum,
  VoteModeGatewayEnum,
  ReportReviewRequest,
  CreateCompanyReviewRequest,
} from './reviewTypes';

interface FetchCompanyReviewsParams {
  take?: number;
  pageNum?: number;
  sort?: ReviewsSortGatewayEnum;
}

const isCompanyReviewsKey = (key: unknown, companyId?: string): boolean => {
  return (
    Array.isArray(key) &&
    key[0] === 'company-reviews' &&
    (companyId ? key[1] === companyId : true)
  );
};

export const invalidateCompanyReviewCaches = async (companyId?: string): Promise<void> => {
  await Promise.all([
    mutateCache((key) => isCompanyReviewsKey(key, companyId)),
  ]);
};

export const reviewApi = {
  async voteReview(reviewId: string, mode: VoteModeGatewayEnum): Promise<void> {
    await http.patch(`/api/users/reviews/${reviewId}/vote`, { mode });
  },

  async reportReview(reviewId: string, data: ReportReviewRequest): Promise<void> {
    await http.post(`/api/users/reviews/${reviewId}/report`, data);
  },

  async fetchCompanyReviews(
    companyId: string,
    params: FetchCompanyReviewsParams = {},
  ): Promise<CompanyReviewListResponse> {
    const { take = 20, pageNum = 1, sort = 'Newest' } = params;
    const response = await http.get<CompanyReviewListResponse>(
      `/api/companies/${companyId}/reviews`,
      { take, pageNum, sort },
    );
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
        data: { reviewId },
      },
    });
  },
};

export const useCreateCompanyReview = () => {
  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: string;
      data: CreateCompanyReviewRequest;
    }) => reviewApi.createCompanyReview(companyId, data),
    onSuccess: async (_data, { companyId }) => {
      await invalidateCompanyReviewCaches(companyId);
    },
  });
};

export const useUpdateCompanyReview = () => {
  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: UpdateCompanyReviewRequest;
    }) => reviewApi.updateCompanyReview(reviewId, data),
  });
};
