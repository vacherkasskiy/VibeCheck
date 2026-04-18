import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { GamificationAuthState, GamificationAction } from './types';
import type { MeResponse, IssueTokenResponse } from 'entities/gamification/model/types';
import type { ReactNode } from 'react';

const GAMIFICATION_API_BASE = 'http://gamification.local/api';
const TOKEN_KEY = 'gamificationToken';

const gamificationAuthReducer = (state: GamificationAuthState, action: GamificationAction): GamificationAuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_AUTH':
      return {
        ...state,
        isAuthenticated: !!action.payload.userId,
        userId: action.payload.userId,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      localStorage.removeItem(TOKEN_KEY);
      return { isAuthenticated: false, userId: null, token: null, loading: false, error: null };
    default:
      return state;
  }
};

interface GamificationAuthContextType {
  state: GamificationAuthState;
  login: () => Promise<void>;
  logout: () => void;
}

const GamificationAuthContext = createContext<GamificationAuthContextType | undefined>(undefined);

export const GamificationAuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gamificationAuthReducer, {
    isAuthenticated: false,
    userId: null,
    token: null,
    loading: true,
    error: null,
  });

  const fetchToken = async (): Promise<string | null> => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) return savedToken;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch(`${GAMIFICATION_API_BASE}/test-auth/token?expiresMinutes=60`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to fetch token');
      const data: IssueTokenResponse = await response.json();
      if (data.accessToken) {
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        return data.accessToken;
      }
      throw new Error('No access token received');
    } catch (error) {
      console.error('Token fetch error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to obtain gamification token' });
      return null;
    }
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${GAMIFICATION_API_BASE}/test-auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return false;
      const data: MeResponse = await response.json();
      dispatch({
        type: 'SET_AUTH',
        payload: { userId: data.userId || null, token },
      });
      return data.isAuthenticated;
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Invalid token' });
      return false;
    }
  };

  const initializeAuth = async () => {
    const token = await fetchToken();
    if (token) {
      await validateToken(token);
    } else {
      dispatch({ type: 'SET_AUTH', payload: { userId: null, token: null } });
    }
  };

  const login = async () => {
    await initializeAuth();
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <GamificationAuthContext.Provider value={{ state, login, logout }}>
      {children}
    </GamificationAuthContext.Provider>
  );
};

export const useGamificationAuth = () => {
  const context = useContext(GamificationAuthContext);
  if (context === undefined) {
    throw new Error('useGamificationAuth must be used within GamificationAuthProvider');
  }
  return context;
};
