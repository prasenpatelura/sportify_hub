import { users, venues, bookings, games } from '../mock/data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (email?: string, password?: string) => {
  await delay(800);
  const user = users.find(u => u.email === email) || users[0];
  return Promise.resolve({ user, token: 'mock-jwt-token-123' });
};

export const getVenues = async () => {
  await delay(500);
  return Promise.resolve(venues);
};

export const getVenueDetails = async (id: string) => {
  await delay(300);
  const venue = venues.find(v => v.id === id);
  if (!venue) throw new Error('Venue not found');
  return Promise.resolve(venue);
};

export const getGames = async () => {
  await delay(600);
  return Promise.resolve(games);
};

export const bookSlot = async (venueId: string, date: string, timeSlot: string) => {
  await delay(1000);
  const newBooking = {
    id: `b${bookings.length + 1}`,
    venueId,
    userId: '1',
    date,
    timeSlot,
    status: 'Confirmed'
  };
  bookings.push(newBooking);
  return Promise.resolve(newBooking);
};

export const joinGame = async (gameId: string) => {
  await delay(500);
  const game = games.find(g => g.id === gameId);
  if (!game) throw new Error('Game not found');
  if (game.players.length >= game.maxPlayers) throw new Error('Game is full');
  
  if (!game.players.includes('1')) {
    game.players.push('1');
  }
  return Promise.resolve(game);
};

export const getUserBookings = async () => {
  await delay(400);
  const populated = bookings.map(b => ({
    ...b,
    venue: venues.find(v => v.id === b.venueId)
  }));
  return Promise.resolve(populated);
};
