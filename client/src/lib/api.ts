import { useAuthStore } from '@/store/auth';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(method: string, path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...((init?.headers as Record<string, string>) ?? {})
  };
  const access = useAuthStore.getState().access;
  if (access) headers.Authorization = `Bearer ${access}`;

  const url = `${API_BASE}/api${path}`;
  let res = await fetch(url, {
    method,
    headers,
    body: body ? (isForm ? (body as FormData) : JSON.stringify(body)) : undefined,
    ...init
  });

  // try refresh on 401
  if (res.status === 401 && useAuthStore.getState().refresh && !path.startsWith('/auth/')) {
    const ok = await useAuthStore.getState().tryRefresh();
    if (ok) {
      const access2 = useAuthStore.getState().access;
      if (access2) headers.Authorization = `Bearer ${access2}`;
      res = await fetch(url, {
        method,
        headers,
        body: body ? (isForm ? (body as FormData) : JSON.stringify(body)) : undefined,
        ...init
      });
    }
  }

  const contentType = res.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (typeof data === 'object' && data && 'error' in data ? (data as any).error : data) || res.statusText;
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

export const api = {
  get: <T = any>(p: string) => request<T>('GET', p),
  post: <T = any>(p: string, body?: unknown) => request<T>('POST', p, body),
  patch: <T = any>(p: string, body?: unknown) => request<T>('PATCH', p, body),
  put: <T = any>(p: string, body?: unknown) => request<T>('PUT', p, body),
  delete: <T = any>(p: string) => request<T>('DELETE', p),
  upload: <T = any>(p: string, form: FormData) => request<T>('POST', p, form)
};
