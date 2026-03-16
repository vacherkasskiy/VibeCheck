export interface CompanyFlag {
  id: string;
  name: string;
  count: number;
}

export interface CompanyContact {
  id: string;
  type: 'email' | 'linkedin' | 'telegram' | 'website';
  value: string;
  url: string;
}

export interface ReviewReaction {
  likes: number;
  dislikes: number;
}

export interface CompanyReview {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  position?: string;
  text: string;
  flags: CompanyFlag[];
  reactions: ReviewReaction;
}

export interface CompanyDTO {
  id: string;
  name: string;
  logoUrl?: string | null;
  description?: string;
  topFlags: CompanyFlag[];
  contacts?: CompanyContact[];
  reviews?: CompanyReview[];
}
