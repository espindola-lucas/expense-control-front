import { apiFetch, buildQuery } from './client';
import { Budget } from '../types';

export function fetchBudgets(month?: string) {
  return apiFetch<Budget[]>(`/budgets${buildQuery({ month })}`);
}

interface BudgetPayload {
  category_id: number;
  month: string;
  amount: number;
}

export function createBudget(payload: BudgetPayload) {
  return apiFetch<Budget>('/budgets', { method: 'POST', body: payload });
}

export function updateBudget(id: number, payload: BudgetPayload) {
  return apiFetch<Budget>(`/budgets/${id}`, { method: 'PUT', body: payload });
}

export function deleteBudget(id: number) {
  return apiFetch<void>(`/budgets/${id}`, { method: 'DELETE' });
}
