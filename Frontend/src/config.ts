import { API_BASE_URL } from '@env';

const BASE_URL = API_BASE_URL;

export const config = {
  baseUrl: BASE_URL,
  leadsUrl: `${BASE_URL}/api/leads`,
  socket: {
    path: '/socket.io',
    transports: ['websocket'] as const,
    autoConnect: false,
  },
} as const;

export default config;