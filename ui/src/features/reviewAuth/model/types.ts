export interface ReviewAuthState {
  token: string | null;
  expiresAt: string | null;
  loading: boolean;
  error: string | null;
}

export type UseReviewAuthResult = {
  state: ReviewAuthState;
  fetchToken: () => Promise<void>;
  refreshToken: () => Promise<void>;
};
