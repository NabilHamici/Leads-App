import { API_BASE_URL } from '@env';
import type { ManagerOptions, SocketOptions } from 'socket.io-client';

const BASE_URL = API_BASE_URL;

const socketOptions: Partial<ManagerOptions & SocketOptions> = {
  path: '/socket.io',          
  transports: ['websocket'],   
  autoConnect: false,         
};

export const config = {
  baseUrl: BASE_URL,
  leadsUrl: `${BASE_URL}/api/leads`,
  socket: socketOptions,
} as const;

export default config;