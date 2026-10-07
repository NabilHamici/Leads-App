import config from '../config';
import type { LeadsResponse } from '../types';

const REQUEST_TIMEOUT_MS = 8000;

export class LeadsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeadsApiError';
  }
}


export const getLeads = async (): Promise<LeadsResponse> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(config.leadsUrl, { signal: controller.signal });
  } catch {
    throw new LeadsApiError('Cannot reach the server');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new LeadsApiError(`Server responded ${res.status}`);
  }

  const data = (await res.json().catch(() => null)) as LeadsResponse | null;

  if (!data || !Array.isArray(data.leads)) {
    throw new LeadsApiError('Unexpected response shape');
  }

  return data;
};

export default getLeads;