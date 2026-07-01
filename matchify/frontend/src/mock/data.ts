export const mockUser = {
  _id: 'user-001',
  name: 'Prasen',
  email: 'prasen@matchify.com',
  level: 5,
  xp: 1200,
  streak: 12,
  badges: ['Top Player', 'Weekend Warrior'],
  matchesPlayed: 45,
  winRate: 68
};

export const mockVenues = [
  {
    _id: 'v-001',
    name: 'Neon Arena',
    location: { coordinates: [77.5946, 12.9716], type: 'Point' },
    sports: ['Football', 'Tennis'],
    pricePerHour: 1500,
    rating: 4.8,
    status: 'open',
    amenities: ['Parking', 'Showers', 'Cafe'],
    availableSlots: ['06:00', '07:00', '18:00', '19:00', '20:00']
  },
  {
    _id: 'v-002',
    name: 'Skyline Sports Hub',
    location: { coordinates: [77.6100, 12.9500], type: 'Point' },
    sports: ['Basketball', 'Badminton'],
    pricePerHour: 800,
    rating: 4.5,
    status: 'open',
    amenities: ['Lockers', 'Equipment Rent'],
    availableSlots: ['05:00', '08:00', '16:00', '17:00', '21:00']
  },
  {
    _id: 'v-003',
    name: 'Velocity Turf',
    location: { coordinates: [77.6200, 12.9300], type: 'Point' },
    sports: ['Football', 'Cricket'],
    pricePerHour: 2000,
    rating: 4.9,
    status: 'open',
    amenities: ['Floodlights', 'Dressing Room'],
    availableSlots: ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
  }
];

export const mockGames = [
  {
    _id: 'g-001',
    sport: 'Football',
    date: '2026-03-30',
    time: '18:00',
    venueId: mockVenues[0],
    hostId: { _id: 'user-002', name: 'Alex' },
    players: ['user-002', 'user-003'],
    maxPlayers: 10,
    skillLevel: 'Intermediate',
    status: 'open'
  },
  {
    _id: 'g-002',
    sport: 'Basketball',
    date: '2026-03-31',
    time: '07:00',
    venueId: mockVenues[1],
    hostId: { _id: 'user-004', name: 'Sarah' },
    players: ['user-004', 'user-005', 'user-006', 'user-007'],
    maxPlayers: 10,
    skillLevel: 'Advanced',
    status: 'open'
  }
];

export const mockBookings = [
  {
    _id: 'b-001',
    userId: 'user-001',
    venueId: mockVenues[2],
    date: '2026-04-05',
    timeSlot: '19:00',
    status: 'confirmed',
    totalPrice: 2000
  }
];

export const mockStats = {
  matchesPlayed: 45,
  winRate: 68,
  xpEarned: 1200,
  history: [
    { _id: 'h1', date: '2026-03-25', sport: 'Football', result: 'Win', xpChange: '+50' },
    { _id: 'h2', date: '2026-03-20', sport: 'Basketball', result: 'Loss', xpChange: '+20' },
    { _id: 'h3', date: '2026-03-15', sport: 'Football', result: 'Win', xpChange: '+50' }
  ]
};
