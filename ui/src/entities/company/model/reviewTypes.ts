import type { CompanyFlag } from './types';

export type ReviewsSortGatewayEnum = 'CREATED_AT_DESC' | 'CREATED_AT_ASC' | 'LIKES_DESC' | 'DISLIKES_DESC';

export type VoteMode = 'Like' | 'Dislike' | 'Clear';

export type ReportReasonType = 'SPAM' | 'OFFENSIVE' | 'INACCURATE' | 'OTHER'; // assume common values


export interface CreateCompanyReviewRequest {
  text?: string;
  flags: string[]; 
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
  items: CompanyReview[];
  total: number;
}

export interface UserReviewsResponse {
  items: CompanyReview[];
  total: number;
}

