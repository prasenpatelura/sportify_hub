// All data calls go through the matchify Express backend.
// Falls back to mock data when the backend is not reachable.

import {
  apiGetVenues, apiGetVenueById, apiGetGames,
  apiJoinGame, apiCreateBooking, apiGetUserBookings,
} from './backendApi';
import { venues as mockVenues, games as mockGames, bookings as mockBookings } from '../mock/data';

// Normalise venues so both data shapes work (backend & mock)
const normaliseVenue = (v: any) => ({
  id: v._id || v.id,
  name: v.name,
  location: typeof v.location === 'string' ? v.location : (v.location?.address || 'Bangalore'),
  price: v.pricePerHour || v.price || 0,
  rating: v.rating || 4.5,
  image: (v.images && v.images[0]) || v.image || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
  sports: v.sports || [],
  availableSlots: v.availableSlots || [],
});

const normaliseGame = (g: any) => ({
  id: g._id || g.id,
  sport: g.sport,
  level: g.skillLevel || g.level || 'Intermediate',
  date: g.date,
  time: g.time,
  location: typeof g.venueId === 'object' ? g.venueId?.name : (g.location || 'Elite Turf'),
  players: g.players || [],
  maxPlayers: g.maxPlayers || 10,
  status: g.status || 'open',
});

let _listeners: Array<(games: any[]) => void> = [];
let _pollInterval: ReturnType<typeof setInterval> | null = null;

// ─── Seed (no-op — backend handles its own seed) ─────────────────────────────
export const seedDatabase = async () => {};

// ─── Venues ──────────────────────────────────────────────────────────────────
export const getVenuesFromDB = async (): Promise<any[]> => {
  try {
    const data = await apiGetVenues();
    return (Array.isArray(data) ? data : []).map(normaliseVenue);
  } catch {
    return mockVenues.map(normaliseVenue);
  }
};

export const getVenueDetailsFromDB = async (id: string): Promise<any> => {
  try {
    const data = await apiGetVenueById(id);
    return normaliseVenue(data);
  } catch {
    const v = mockVenues.find(v => v.id === id);
    if (!v) throw new Error('Venue not found');
    return normaliseVenue(v);
  }
};

// ─── Games ───────────────────────────────────────────────────────────────────
export const getGamesFromDB = async (): Promise<any[]> => {
  try {
    const data = await apiGetGames();
    return (Array.isArray(data) ? data : []).map(normaliseGame);
  } catch {
    return mockGames.map(normaliseGame);
  }
};

export const subscribeToGames = (callback: (games: any[]) => void): (() => void) => {
  _listeners.push(callback);

  // Initial fetch
  getGamesFromDB().then(callback);

  // Poll every 8 seconds for live-ish updates
  if (!_pollInterval) {
    _pollInterval = setInterval(async () => {
      const data = await getGamesFromDB();
      _listeners.forEach(fn => fn(data));
    }, 8000);
  }

  return () => {
    _listeners = _listeners.filter(fn => fn !== callback);
    if (_listeners.length === 0 && _pollInterval) {
      clearInterval(_pollInterval);
      _pollInterval = null;
    }
  };
};

export const joinGameInDB = async (gameId: string, userId: string): Promise<void> => {
  try {
    await apiJoinGame(gameId, userId);
  } catch (e: any) {
    throw new Error(e.message || 'Could not join game');
  }
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookSlotInDB = async (
  userId: string,
  venueId: string,
  venueName: string,
  date: string,
  timeSlot: string
): Promise<any> => {
  try {
    return await apiCreateBooking({ userId, venueId, date, timeSlot });
  } catch {
    return { id: `b${Date.now()}`, userId, venueId, venueName, date, timeSlot, status: 'Confirmed' };
  }
};

export const getUserBookingsFromDB = async (userId: string): Promise<any[]> => {
  try {
    const data = await apiGetUserBookings(userId);
    return (Array.isArray(data) ? data : []).map((b: any) => ({
      ...b,
      id: b._id || b.id,
      venue: b.venueId ? normaliseVenue(b.venueId) : null,
    }));
  } catch {
    return mockBookings.map(b => ({
      ...b,
      venue: mockVenues.find(v => v.id === b.venueId),
    }));
  }
};
