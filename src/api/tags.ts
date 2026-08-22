import { apiFetch } from './client';
import { Tag } from '../types';

export function fetchTags() {
  return apiFetch<Tag[]>('/tags');
}

interface TagPayload {
  name: string;
}

export function createTag(payload: TagPayload) {
  return apiFetch<Tag>('/tags', { method: 'POST', body: payload });
}

export function updateTag(id: number, payload: TagPayload) {
  return apiFetch<Tag>(`/tags/${id}`, { method: 'PUT', body: payload });
}

export function deleteTag(id: number) {
  return apiFetch<void>(`/tags/${id}`, { method: 'DELETE' });
}
