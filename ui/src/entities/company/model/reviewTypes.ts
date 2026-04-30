import type { CompanyFlag } from './types';

export type ReviewsSortGatewayEnum = 'Newest' | 'Oldest' | 'BestScore' | 'WorstScore' | 'WeightDesc' | 'WeightAsc';

export type VoteModeGatewayEnum = 'Like' | 'Dislike' | 'Clear';

export type VoteMode = VoteModeGatewayEnum;

export type ReportReasonGatewayEnum = 'Spam' | 'Harassment' | 'Hate' | 'Nudity' | 'Violence' | 'Other';

export type ReportReasonType = ReportReasonGatewayEnum;


export interface CreateCompanyReviewRequest {
  text?: string;
  flags: string[] | null;
  companyId: string;
}

export interface UpdateCompanyReviewRequest {
  text?: string;
}

export interface DeleteCompanyReviewRequest {
  reviewId: string;
}

export interface VoteReviewRequest {
  mode: VoteMode;
}

export interface ReportReviewRequest {
  reasonType: ReportReasonType;
  reasonText?: string;
}

import type { CompanyReview } from './types';

export interface CompanyReviewListResponse {
  reviews: CompanyReview[] | null;
  totalCount: number;
}

export interface UserReviewsResponse {
  reviews: CompanyReview[] | null;
  totalCount: number;
}
