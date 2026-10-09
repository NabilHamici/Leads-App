import config from '../config';
import type { LeadsResponse } from '../types';

const REQUEST_TIMEOUT_MS = 8000;

export class LeadsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeadsApiError';
  }
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: controller.signal });
  } catch {
    throw new LeadsApiError('Cannot reach the server');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new LeadsApiError(`Server responded ${res.status}`);
  }

  return (await res.json().catch(() => null)) as T;
};

export const getLeads = async (): Promise<LeadsResponse> => {
  const data = await request<LeadsResponse | null>(config.leadsUrl);

  if (!data || !Array.isArray(data.leads)) {
    throw new LeadsApiError('Unexpected response shape');
  }

  return data;
};

export const deleteLead = async (id: string): Promise<boolean> => {
  const data = await request<{ deleted?: boolean } | null>(
    `${config.leadsUrl}/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );

  return Boolean(data?.deleted);
};

export const clearLeads = async (): Promise<number> => {
  const data = await request<{ cleared?: number } | null>(config.leadsUrl, {
    method: 'DELETE',
  });

  return data?.cleared ?? 0;
};

export default getLeads;
