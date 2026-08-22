import { apiFetch } from './client';
import { Category } from '../types';

export function fetchCategories() {
  return apiFetch<Category[]>('/categories');
}

interface CategoryPayload {
  name: string;
  type: 'expense' | 'income';
  icon?: string | null;
}

export function createCategory(payload: CategoryPayload) {
  return apiFetch<Category>('/categories', { method: 'POST', body: payload });
}

export function updateCategory(id: number, payload: CategoryPayload) {
  return apiFetch<Category>(`/categories/${id}`, { method: 'PUT', body: payload });
}

export function deleteCategory(id: number) {
  return apiFetch<void>(`/categories/${id}`, { method: 'DELETE' });
}
