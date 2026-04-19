import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { setAccessTokenProvider } from 'shared/api/http';
import http from 'shared/api/http';
import type { AuthState, AuthAction, AuthContextType } from './types';
import type { ReactNode } from 'react';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
	switch (action.type) {
		case 'SET_LOADING':
			return { ...state, loading: action.payload, error: null };
		case 'SET_TOKENS':
			if (action.payload.accessToken) {
				localStorage.setItem(ACCESS_TOKEN_KEY, action.payload.accessToken);
			} else {
				localStorage.removeItem(ACCESS_TOKEN_KEY);
			}
			if (action.payload.refreshToken !== null) {
				if (action.payload.refreshToken) {
					localStorage.setItem(REFRESH_TOKEN_KEY, action.payload.refreshToken);
				} else {
					localStorage.removeItem(REFRESH_TOKEN_KEY);
				}
			}
			return {
				...state,
				isAuthenticated: !!action.payload.accessToken,
				accessToken: action.payload.accessToken,
				refreshToken: action.payload.refreshToken,
				loading: false,
				error: null,
			};
		case 'SET_ERROR':
			return { ...state, error: action.payload, loading: false };
		case 'LOGOUT':
			localStorage.removeItem(ACCESS_TOKEN_KEY);
			localStorage.removeItem(REFRESH_TOKEN_KEY);
			setAccessTokenProvider(null);
			return {
				isAuthenticated: false,
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: null,
			};
		default:
			return state;
	}
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [state, dispatch] = useReducer(authReducer, {
		isAuthenticated: false,
		accessToken: null,
		refreshToken: null,
		loading: true,
		error: null,
	});

	const refreshTokens = async (): Promise<boolean> => {
		const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
		if (!refreshToken) {
			dispatch({ type: 'SET_ERROR', payload: 'No refresh token available' });
			return false;
		}

		try {
			dispatch({ type: 'SET_LOADING', payload: true });
			const response = await http.post<{ accessToken: string }>('/api/auth/refresh', {
				refreshToken,
			});
			if (response.data.accessToken) {
				dispatch({
					type: 'SET_TOKENS',
					payload: { accessToken: response.data.accessToken, refreshToken: null }, // Backend typically returns new refresh too, but assume simple for now
				});
				setAccessTokenProvider(() => localStorage.getItem(ACCESS_TOKEN_KEY));
				return true;
			}
			return false;
		} catch (error) {
			console.error('Token refresh failed:', error);
			dispatch({ type: 'LOGOUT' });
			return false;
		}
	};

	const logout = () => {
		dispatch({ type: 'LOGOUT' });
	};

	useEffect(() => {
		const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
		const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
		if (accessToken) {
			dispatch({
				type: 'SET_TOKENS',
				payload: { accessToken, refreshToken },
			});
			setAccessTokenProvider(() => localStorage.getItem(ACCESS_TOKEN_KEY));
		} else {
			dispatch({ type: 'SET_TOKENS', payload: { accessToken: null, refreshToken } });
		}
	}, []);

	return (
		<AuthContext.Provider value={{ state, refreshTokens, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
};
