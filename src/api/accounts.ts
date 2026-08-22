import { apiFetch } from './client';
import { Account } from '../types';

export function fetchAccounts() {
  return apiFetch<Account[]>('/accounts');
}

interface AccountPayload {
  name: string;
  type: 'cash' | 'bank' | 'other';
  initial_balance?: number;
  is_archived?: boolean;
}

export function createAccount(payload: AccountPayload) {
  return apiFetch<Account>('/accounts', { method: 'POST', body: payload });
}

export function updateAccount(id: number, payload: AccountPayload) {
  return apiFetch<Account>(`/accounts/${id}`, { method: 'PUT', body: payload });
}

export function deleteAccount(id: number) {
  return apiFetch<void>(`/accounts/${id}`, { method: 'DELETE' });
}
