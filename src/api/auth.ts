import { apiFetch } from './client';
import { AuthUser } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export function login(payload: LoginPayload) {
  return apiFetch<LoginResponse>('/login', { method: 'POST', body: payload });
}

export function logout() {
  return apiFetch<void>('/logout', { method: 'POST' });
}
