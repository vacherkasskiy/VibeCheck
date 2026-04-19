export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TOKENS'; payload: { accessToken: string | null; refreshToken: string | null } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

export interface AuthContextType {
  state: AuthState;
  refreshTokens: () => Promise<boolean>;
  logout: () => void;
}

