import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Http, setAccessTokenProvider } from 'shared/api/http';
import type { GamificationAuthState, UseGamificationAuthResult } from './types';
import type { ReactNode } from 'react';

const GATEWAY_API_BASE = __API_URL__ || 'http://gateway.local/';

let gamificationHttp: Http;

interface GamificationAuthProviderProps {
	children: ReactNode;
}

const GamificationAuthContext = createContext<UseGamificationAuthResult | null>(null);

export const GamificationAuthProvider: React.FC<GamificationAuthProviderProps> = ({ children }) => {
	const [state, setState] = useState<GamificationAuthState>({
		token: null,
		expiresAt: null,
		loading: true,
		error: null,
	});

	const fetchToken = useCallback(async () => {
		try {
			setState((prev) => ({ ...prev, loading: true, error: null }));
			const token = localStorage.getItem('accessToken');
			if (token) {
				gamificationHttp = new Http(GATEWAY_API_BASE);
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
		const interval = setInterval(
			() => {
				if (state.token) refreshToken();
			},
			50 * 60 * 1000,
		); // Refresh every 50 min

		return () => clearInterval(interval);
	}, [state.token, refreshToken]);

	return (
		<GamificationAuthContext.Provider
			value={{ state, fetchToken, refreshToken, gamificationHttp }}
		>
			{children}
		</GamificationAuthContext.Provider>
	);
};

export const useGamificationAuth = (): UseGamificationAuthResult => {
	const context = useContext(GamificationAuthContext);
	if (!context) {
		throw new Error('useGamificationAuth must be used within GamificationAuthProvider');
	}
	return context;
};

export { gamificationHttp };
