export interface GamificationAuthState {
  isAuthenticated: boolean;
  userId: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export type GamificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH'; payload: { userId: string | null; token: string | null } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };
