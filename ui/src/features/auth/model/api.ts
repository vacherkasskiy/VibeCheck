import http from 'shared/api/http';
import type { 
  RegisterRequest, RegisterResponse,
  LoginRequest, LoginResponse,
  PasswordResetRequest, PasswordConfirmRequest, RefreshResponse 
} from './types';

export const register = async (data: RegisterRequest): Promise<void> => {
  await http.post('/auth/email/register', data);
};

export const registerConfirm = async (code: string): Promise<{accessToken: string; refreshToken: string}> => {
  const res = await http.post<{accessToken: string; refreshToken: string}>('/auth/email/register/confirm?confirmCode=' + parseInt(code), undefined);
  return res.data;
};

export const registerResend = async (data: RegisterRequest): Promise<void> => {
  await http.post('/auth/email/register', data);
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await http.post<LoginResponse>('/auth/email/login', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await http.post('/auth/logout');
};

export const refreshAccessToken = async (refreshToken: string): Promise<RefreshResponse> => {
  const response = await http.post<RefreshResponse>('auth/refresh', { refreshToken });
  return response.data;
};

export const passwordReset = async (data: PasswordResetRequest): Promise<void> => {
  await http.post('/auth/email/password/reset', data);
};

export const passwordResetResend = async (data: PasswordResetRequest): Promise<void> => {
  await http.post('/auth/email/password/reset', data);
};

export const passwordConfirm = async (code: string, data: PasswordConfirmRequest): Promise<void> => {
  const url = `/auth/email/password/reset?confirmCode=${code}`;
  await http.put(url, data);
};

