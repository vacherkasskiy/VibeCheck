import { useState } from 'react';
import http from 'shared/api/http';
import { useAuth } from './AuthProvider';
import type { RegisterRequest, RegisterResponse } from './types';

export const useRegister = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuth();

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await http.post<RegisterResponse>('/api/auth/email/register', data);
      dispatch({ type: 'REGISTER_SUCCESS', payload: response.data });
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ошибка регистрации';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
};
