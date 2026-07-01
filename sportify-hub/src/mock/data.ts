export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image?: string;
  sports?: string[];
}

export interface Booking {
  id: string;
  userId: string;
  venueId: string;
  date: string;
  timeSlot: string;
  status: string;
}

export interface Game {
  id: string;
  sport: string;
  venueId: string;
  date: string;
  time: string;
  players: string[];
  maxPlayers: number;
  level: string;
}

export const users: User[] = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com' },
  { id: 'u2', name: 'Jane Smith', email: 'jane@example.com' }
];

export const venues: Venue[] = [
  {
    id: "1",
    name: "Elite Turf",
    location: "Hyderabad",
    price: 800,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
    sports: ['Football', 'Cricket']
  },
  {
    id: "2",
    name: "Smash Arena",
    location: "Bangalore",
    price: 500,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1622279457486-640c4cb4ebf6',
    sports: ['Badminton', 'Tennis']
  },
  {
    id: "3",
    name: "Hoops Court",
    location: "Mumbai",
    price: 1200,
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
    sports: ['Basketball']
  }
];

export const bookings: Booking[] = [
  { id: 'b1', userId: '1', venueId: '1', date: '2023-11-01', timeSlot: '18:00', status: 'Confirmed' },
  { id: 'b2', userId: '1', venueId: '2', date: '2023-11-05', timeSlot: '19:00', status: 'Pending' }
];

export const games: Game[] = [
  { id: 'g1', sport: 'Football', venueId: '1', date: '2023-11-02', time: '17:00', players: ['1', '2'], maxPlayers: 14, level: 'Intermediate' },
  { id: 'g2', sport: 'Badminton', venueId: '2', date: '2023-11-03', time: '07:00', players: ['1'], maxPlayers: 4, level: 'Beginner' }
];
