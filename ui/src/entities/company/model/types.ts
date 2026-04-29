export interface CompanyFlag {
  id: string;
  name: string | null;
  count: number;
}

export interface CompanyLinksDto {
  site?: string | null;
  linkedin?: string | null;
  hh?: string | null;
}

export interface ReviewFlagDto {
  id: string;
  name: string | null;
}

export interface CompanyReview {
  weight: number;
  reviewId: string;
  authorId: string;
  iconId: string | null;
  text: string | null;
  score: number;
  createdAt: string;
  flags: ReviewFlagDto[] | null;
}

export interface CompanyDTO {
  companyId: string;
  name: string | null;
  iconUrl: string | null;
  weight?: number;
  description?: string | null;
  links?: CompanyLinksDto | null;
  topFlags: CompanyFlag[] | null;
}
