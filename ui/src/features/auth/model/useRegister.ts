import { useState } from 'react';
import { register as registerWithEmail } from './api';
import type { RegisterRequest } from './types';

export const useRegister = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError('');
    try {
      await registerWithEmail(data);
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
