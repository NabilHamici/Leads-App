import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import config from '../config';
import { getLeads } from '../api/leadsApi';
import type { Lead } from '../types';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface UseLeadsSocketResult {

  leads: Lead[];
  status: ConnectionStatus;

  isLoading: boolean;
 
  error: string | null;
  
  refresh: () => Promise<void>;
}

const byNewestFirst = (a: Lead, b: Lead) => b.createdAt - a.createdAt;

const isLead = (value: unknown): value is Lead =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Lead).id === 'string';

const mergeLeads = (current: Lead[], incoming: Lead[]): Lead[] => {
  const known = new Set(current.map((lead) => lead.id));
  const fresh = incoming.filter((lead) => !known.has(lead.id));

  return fresh.length > 0 ? [...current, ...fresh].sort(byNewestFirst) : current;
};

export const useLeadsSocket = (): UseLeadsSocketResult => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = await getLeads();
      setLeads((prev) => mergeLeads(prev, payload.leads));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Live feed.
  useEffect(() => {
    const socket = io(config.baseUrl, { ...config.socket });

    socket.on('connect', () => setStatus('connected'));
    socket.on('disconnect', () => setStatus('disconnected'));
    socket.on('connect_error', () => setStatus('disconnected'));

    socket.on('lead:new', (lead: Lead) => {
      if (!isLead(lead)) {
        return;
      }
      setLeads((prev) =>
        prev.some((item) => item.id === lead.id)
          ? prev
          : [...prev, lead].sort(byNewestFirst),
      );
    });

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  return { leads, status, isLoading, error, refresh };
};

export default useLeadsSocket;