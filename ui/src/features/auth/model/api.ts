import axios from 'axios'; // raw axios for manual refresh
import http from 'shared/api/http';
import type { 
  RegisterRequest, RegisterResponse,
  LoginRequest, LoginResponse,
  PasswordResetRequest, PasswordConfirmRequest, RefreshResponse 
} from './types';

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await http.post<RegisterResponse>('/auth/email/register', data);
  return response.data;
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await http.post<LoginResponse>('/auth/email/login', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await http.post('/auth/logout');
};

export const refreshAccessToken = async (refreshToken: string): Promise<RefreshResponse> => {
  const response = await axios.post<RefreshResponse>('/auth/refresh', {}, {
    headers: {
      Authorization: `Bearer ${refreshToken}`
    }
  });
  return response.data;
};

export const passwordReset = async (data: PasswordResetRequest): Promise<void> => {
  await http.post('/auth/email/password/reset', data);
};

export const passwordConfirm = async (code: string, data: PasswordConfirmRequest): Promise<void> => {
  const url = `/auth/email/password/confirm?confirmCode=${code}`;
  await http.put(url, data);
};
