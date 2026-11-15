import { auth } from './firebase.js';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

export async function apiFetch(
  path,
  { method = 'GET', body, authenticated = true, timeoutMs = 15000 } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = {};

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (authenticated) {
      const token = await auth.currentUser?.getIdToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.error?.message || 'Falha na requisição.');
      error.status = response.status;
      error.code = data?.error?.code;
      error.fields = data?.error?.fields ?? [];
      throw error;
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}
