import type { ReactNode } from 'react';
import type { Http } from 'shared/api/http';

export interface GamificationAuthState {
  token: string | null;
  expiresAt: string | null;
  loading: boolean;
  error: string | null;
}

export interface UseGamificationAuthResult {
  state: GamificationAuthState;
  fetchToken: () => Promise<void>;
  refreshToken: () => Promise<void>;
  gamificationHttp: Http | undefined;
}

