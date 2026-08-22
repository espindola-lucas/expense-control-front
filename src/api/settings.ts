import { apiFetch } from './client';
import { UserSettings } from '../types';

export function fetchUserSettings() {
  return apiFetch<UserSettings>('/user-settings');
}

export function updateUserSettings(payload: UserSettings) {
  return apiFetch<UserSettings>('/user-settings', { method: 'PUT', body: payload });
}
