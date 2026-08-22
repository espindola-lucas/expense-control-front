import { apiFetch, buildQuery } from './client';
import { DashboardSummary, Expense } from '../types';

interface SpentsResponse extends DashboardSummary {
  spents: Expense[];
}

export function fetchSpents(search?: string) {
  return apiFetch<SpentsResponse>(`/spents${buildQuery({ search })}`);
}

interface SpentPayload {
  name: string;
  amount: number;
  date: string;
}

export function createSpent(payload: SpentPayload) {
  return apiFetch<Expense>('/spents', { method: 'POST', body: payload });
}

export function updateSpent(id: string, payload: SpentPayload) {
  return apiFetch<Expense>(`/spents/${id}`, { method: 'PUT', body: payload });
}

export function deleteSpent(id: string) {
  return apiFetch<void>(`/spents/${id}`, { method: 'DELETE' });
}
