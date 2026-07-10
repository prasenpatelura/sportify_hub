const Venue = require('./models/Venue');
const Game = require('./models/Game');

async function seedIfEmpty() {
  if ((await Venue.count()) > 0) return;

  console.log('[Seed] Inserting initial venues & games...');

  const venues = await Venue.insertMany([
    {
      name: 'Neon Arena',
      location: { address: 'Gachibowli, Hyderabad', lat: 17.4401, lng: 78.3489 },
      sports: ['Football', 'Tennis'],
      pricePerHour: 1500,
      rating: 4.8,
      images: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800'],
      availableSlots: ['06:00', '07:00', '18:00', '19:00', '20:00'],
    },
    {
      name: 'Skyline Sports Hub',
      location: { address: 'Kondapur, Hyderabad', lat: 17.4615, lng: 78.3672 },
      sports: ['Basketball', 'Badminton'],
      pricePerHour: 800,
      rating: 4.5,
      images: ['https://images.unsplash.com/photo-1622279457486-640c4cb4ebf6?w=800'],
      availableSlots: ['05:00', '08:00', '16:00', '17:00', '21:00'],
    },
    {
      name: 'Velocity Turf',
      location: { address: 'Banjara Hills, Hyderabad', lat: 17.4156, lng: 78.4347 },
      sports: ['Football', 'Cricket'],
      pricePerHour: 2000,
      rating: 4.9,
      images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800'],
      availableSlots: ['18:00', '19:00', '20:00', '21:00'],
    },
  ]);

  await Game.insertMany([
    {
      sport: 'Football',
      date: '2026-06-01',
      time: '18:00',
      venueId: venues[0]._id,
      hostId: 'seed-host-1',
      players: [],
      maxPlayers: 10,
      skillLevel: 'Intermediate',
      status: 'open',
    },
    {
      sport: 'Badminton',
      date: '2026-06-02',
      time: '07:00',
      venueId: venues[1]._id,
      hostId: 'seed-host-2',
      players: [],
      maxPlayers: 4,
      skillLevel: 'Beginner',
      status: 'open',
    },
    {
      sport: 'Basketball',
      date: '2026-06-03',
      time: '17:00',
      venueId: venues[1]._id,
      hostId: 'seed-host-3',
      players: [],
      maxPlayers: 10,
      skillLevel: 'Advanced',
      status: 'open',
    },
  ]);

  console.log('[Seed] Done — 3 venues and 3 games inserted.');
}

module.exports = { seedIfEmpty };
