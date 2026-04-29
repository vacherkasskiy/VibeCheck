export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface RegisterRequest {
  login: string;
  password: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TOKENS'; payload: { accessToken: string | null; refreshToken: string | null } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_SUCCESS'; payload: RegisterResponse };


export interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  refreshTokens: () => Promise<boolean>;
  logout: () => void;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export type LoginResponse = RegisterResponse;

export interface PasswordResetRequest {
  email: string;
  newPassword: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
