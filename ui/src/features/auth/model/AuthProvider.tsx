import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAccessTokenProvider, setAuthTokensHandler, setUnauthorizedHandler } from 'shared/api/http';
import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';
import { logout as logoutRequest, refreshAccessToken } from './api';
import styles from './AuthProvider.module.css';
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
		case 'REGISTER_SUCCESS':
			if (action.payload.accessToken) {
				localStorage.setItem('accessToken', action.payload.accessToken);
			}
			localStorage.setItem('refreshToken', action.payload.refreshToken);
			return {
				...state,
				isAuthenticated: true,
				accessToken: action.payload.accessToken,
				refreshToken: action.payload.refreshToken,
				loading: false,
				error: null,
			};
		default:
			return state;
		}
	};


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [state, dispatch] = useReducer(authReducer, {
		isAuthenticated: false,
		accessToken: null,
		refreshToken: null,
		loading: true,
		error: null,
	});
	const [authRequiredMessage, setAuthRequiredMessage] = useState<string | null>(null);

	const requestLogin = useCallback((message = 'Необходимо авторизоваться, чтобы продолжить.') => {
		dispatch({ type: 'LOGOUT' });
		setAuthRequiredMessage((currentMessage) => currentMessage ?? message);
	}, []);

	const handleAuthRequiredClose = useCallback(() => {
		setAuthRequiredMessage(null);
		if (location.pathname !== '/login') {
			navigate('/login', { replace: true });
		}
	}, [location.pathname, navigate]);

	const refreshTokens = async (): Promise<boolean> => {
		const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
		if (!refreshToken) {
			requestLogin();
			return false;
		}

		try {
			dispatch({ type: 'SET_LOADING', payload: true });
		const response = await refreshAccessToken(refreshToken);

			dispatch({
				type: 'SET_TOKENS',
				payload: { accessToken: response.accessToken, refreshToken: response.refreshToken },
			});

			setAccessTokenProvider(() => localStorage.getItem(ACCESS_TOKEN_KEY));
			return true;
		} catch (error) {
			console.error('Token refresh failed:', error);
			requestLogin('Сессия истекла. Войдите снова.');
			return false;
		}
	};

	const logout = async (): Promise<void> => {
		try {
			await logoutRequest();
		} catch (error) {
			console.error('Logout request failed:', error);
		} finally {
			dispatch({ type: 'LOGOUT' });
		}
	};

	useEffect(() => {
		setAccessTokenProvider(() => localStorage.getItem(ACCESS_TOKEN_KEY));
		setAuthTokensHandler((tokens) => {
			dispatch({ type: 'SET_TOKENS', payload: tokens });
		});
		setUnauthorizedHandler((message) => {
			requestLogin(message);
		});

		return () => {
			setAccessTokenProvider(null);
			setAuthTokensHandler(null);
			setUnauthorizedHandler(null);
		};
	}, [requestLogin]);

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
		<AuthContext.Provider value={{ state, dispatch, refreshTokens, logout, requestLogin }}>
			{children}
			<Modal
				isOpen={!!authRequiredMessage}
				onClose={handleAuthRequiredClose}
				className={styles.authRequiredModal}
			>
				<div className={styles.authRequiredContent}>
					<h2 className={styles.authRequiredTitle}>Требуется авторизация</h2>
					<p className={styles.authRequiredText}>
						{authRequiredMessage}
					</p>
					<div className={styles.authRequiredActions}>
						<Button onClick={handleAuthRequiredClose} size="small">
							Перейти ко входу
						</Button>
					</div>
				</div>
			</Modal>
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
