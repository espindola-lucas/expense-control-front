import { apiFetch } from './client';
import { PersonalConfiguration } from '../types';

export function fetchPersonalConfigurations() {
  return apiFetch<PersonalConfiguration[]>('/personal-configurations');
}

interface PersonalConfigurationPayload {
  start_counting: string;
  end_counting: string;
  available_money: number;
  month_available_money: string;
  expense_percentage_limit: number;
}

export function createPersonalConfiguration(payload: PersonalConfigurationPayload) {
  return apiFetch<PersonalConfiguration>('/personal-configurations', { method: 'POST', body: payload });
}

export function updatePersonalConfiguration(id: number, payload: PersonalConfigurationPayload) {
  return apiFetch<PersonalConfiguration>(`/personal-configurations/${id}`, { method: 'PUT', body: payload });
}

export function deletePersonalConfiguration(id: number) {
  return apiFetch<void>(`/personal-configurations/${id}`, { method: 'DELETE' });
}
