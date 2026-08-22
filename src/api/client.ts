export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3101/api';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

// Centralized fetch wrapper: attaches the Bearer token, serializes JSON bodies,
// and clears the session + notifies AuthContext when a token is rejected (401).
export async function apiFetch<T = void>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body: rawBody, headers: optionHeaders, ...rest } = options;
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(optionHeaders as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const init: RequestInit = { ...rest, headers };
  if (rawBody !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(rawBody);
  }

  const res = await fetch(`${API_URL}${path}`, init);

  const contentType = res.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await res.json().catch(() => undefined) : undefined;

  if (res.status === 401 && token) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  if (!res.ok) {
    const message = (data as { message?: string } | undefined)?.message ?? res.statusText;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
