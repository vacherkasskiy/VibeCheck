import { useState } from 'react';
import { login } from './api';
import { useAuth } from './AuthProvider';
import type { LoginRequest, LoginResponse } from './types';

export const useLogin = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuth();

  const signIn = async (data: LoginRequest) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await login(data);
      dispatch({ type: 'SET_TOKENS', payload: { accessToken: response.accessToken, refreshToken: response.refreshToken } });
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ошибка авторизации';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading, error };
};

