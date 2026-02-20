/**
 * Client-side API helper — DOC-050 §2, §5
 * Handles JSON fetch, 8-second timeout, error parsing
 */

export interface ErrorEnvelope {
  category: string;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  recordErrors?: { id: string; code: string; message: string }[];
  retryable: boolean;
}

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  activity?: Record<string, unknown>;
}

export interface ListEnvelope<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const TIMEOUT_MS = 8000;

export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<SuccessEnvelope<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    clearTimeout(timeoutId);
    const json = await response.json();

    if (response.ok && json.success) {
      return json as SuccessEnvelope<T>;
    }

    throw json as ErrorEnvelope;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err && typeof err === 'object' && 'category' in err && 'code' in err) {
      throw err;
    }
    throw {
      category: 'network_unknown',
      code: 'NETWORK_UNKNOWN',
      message: 'תוצאת הפעולה לא ידועה. אנא טען מחדש לבדיקה לפני ניסיון חוזר.',
      retryable: false,
    } as ErrorEnvelope;
  }
}

export async function apiList<T>(url: string): Promise<ListEnvelope<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const json = await response.json();

    if (response.ok && json.data) {
      return json as ListEnvelope<T>;
    }
    throw json as ErrorEnvelope;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err && typeof err === 'object' && 'category' in err && 'code' in err) {
      throw err;
    }
    throw {
      category: 'network_unknown',
      code: 'NETWORK_UNKNOWN',
      message: 'תוצאת הפעולה לא ידועה. אנא טען מחדש לבדיקה לפני ניסיון חוזר.',
      retryable: false,
    } as ErrorEnvelope;
  }
}

export function apiGet<T>(url: string) {
  return apiFetch<T>(url, { method: 'GET' });
}

export function apiPost<T>(url: string, body: unknown) {
  return apiFetch<T>(url, { method: 'POST', body: JSON.stringify(body) });
}

export function apiPut<T>(url: string, body: unknown) {
  return apiFetch<T>(url, { method: 'PUT', body: JSON.stringify(body) });
}

export function apiDelete<T>(url: string, body?: unknown) {
  return apiFetch<T>(url, {
    method: 'DELETE',
    body: body ? JSON.stringify(body) : undefined,
  });
}
