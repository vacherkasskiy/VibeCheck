import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Http, setAccessTokenProvider } from 'shared/api/http';
import type { ReviewAuthState, UseReviewAuthResult } from './types';
import type { ReactNode } from 'react';

const GATEWAY_API_BASE = __API_URL__ || 'http://gateway.local/';

let reviewHttp: Http;

interface ReviewAuthProviderProps {
  children: ReactNode;
}

const ReviewAuthContext = createContext<UseReviewAuthResult | null>(null);

export const ReviewAuthProvider: React.FC<ReviewAuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<ReviewAuthState>({
    token: null,
    expiresAt: null,
    loading: true,
    error: null,
  });

  const fetchToken = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const token = localStorage.getItem('accessToken');
      if (token) {
        reviewHttp = new Http(GATEWAY_API_BASE);
        setState({
          token,
          expiresAt: null,
          loading: false,
          error: null,
        });
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      setState({
        token: null,
        expiresAt: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  const refreshToken = useCallback(async () => {
    await fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    if (state.token) {
      setAccessTokenProvider(() => state.token);
    } else {
      setAccessTokenProvider(null);
    }
  }, [state.token]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (state.token) refreshToken();
    }, 50 * 60 * 1000); 

    return () => clearInterval(interval);
  }, [state.token, refreshToken]);

  return (
    <ReviewAuthContext.Provider value={{ state, fetchToken, refreshToken }}>
      {children}
    </ReviewAuthContext.Provider>
  );
};

export const useReviewAuth = (): UseReviewAuthResult => {
  const context = useContext(ReviewAuthContext);
  if (!context) {
    throw new Error('useReviewAuth must be used within ReviewAuthProvider');
  }
  return context;
};

export { reviewHttp };
