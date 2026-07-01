// Real API client — talks to the matchify Express backend (port 5000).
// Falls back to mock data gracefully if the backend is unreachable.
import axios, { AxiosInstance } from 'axios';
import { mockUser, mockVenues, mockGames, mockBookings, mockStats } from '../mock/data';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Fallback helpers ──────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const mockPost = async (url: string, _data?: any) => {
  await delay(400);
  if (url === '/auth/login' || url === '/auth/register')
    return { data: { token: 'mock-jwt-token', user: mockUser, ...mockUser } };
  if (url === '/games/quick-join')
    return { data: { success: true, message: 'Matched! Joined a game.', gameId: mockGames[0]._id } };
  if (url.startsWith('/games/team-balance'))
    return { data: { success: true, teamA: ['Prasen', 'Alex'], teamB: ['Sarah', 'John'], balanceScore: 50 } };
  if (url.includes('/join'))
    return { data: { success: true, message: 'Joined game successfully' } };
  return { data: { success: true } };
};

const mockGet = async (url: string) => {
  await delay(300);
  if (url === '/venues') return { data: mockVenues };
  if (url.startsWith('/venues/')) return { data: mockVenues[0] };
  if (url === '/games') return { data: mockGames };
  if (url.startsWith('/games/')) return { data: mockGames[0] };
  if (url.startsWith('/bookings/user')) return { data: mockBookings };
  if (url.startsWith('/messages/'))
    return { data: [{ _id: 'm1', senderId: { _id: 'admin', name: 'System' }, content: 'Welcome to the chat!', createdAt: new Date().toISOString() }] };
  if (url === '/stats') return { data: mockStats };
  return { data: {} };
};

// ── Public API object (drop-in replacement for the old mock) ─────────────────
const api = {
  post: async (url: string, data?: any) => {
    try {
      const res = await client.post(url, data);
      return { data: res.data };
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || !err.response) {
        console.warn('[API] Backend unreachable, using mock for POST', url);
        return mockPost(url, data);
      }
      throw err;
    }
  },

  get: async (url: string) => {
    try {
      const res = await client.get(url);
      return { data: res.data };
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || !err.response) {
        console.warn('[API] Backend unreachable, using mock for GET', url);
        return mockGet(url);
      }
      throw err;
    }
  },

  delete: async (url: string) => {
    try {
      const res = await client.delete(url);
      return { data: res.data };
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || !err.response) return { data: { success: true } };
      throw err;
    }
  },
};

export default api;
