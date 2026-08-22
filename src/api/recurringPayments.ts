import { apiFetch } from './client';
import { RecurringPayment } from '../types';

export function fetchRecurringPayments() {
  return apiFetch<RecurringPayment[]>('/recurring-payments');
}

interface RecurringPaymentPayload {
  account_id: number;
  category_id?: number | null;
  name: string;
  type: 'expense' | 'income';
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string | null;
  is_active?: boolean;
}

export function createRecurringPayment(payload: RecurringPaymentPayload) {
  return apiFetch<RecurringPayment>('/recurring-payments', { method: 'POST', body: payload });
}

export function updateRecurringPayment(id: number, payload: RecurringPaymentPayload) {
  return apiFetch<RecurringPayment>(`/recurring-payments/${id}`, { method: 'PUT', body: payload });
}

export function deleteRecurringPayment(id: number) {
  return apiFetch<void>(`/recurring-payments/${id}`, { method: 'DELETE' });
}
