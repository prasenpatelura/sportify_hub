'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';

export default function Dashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    const fetchBookings = async () => {
      try {
        const res = await api.get(`/bookings/user/${user._id}`);
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch bookings', err);
      }
    };
    if (user._id) {
       fetchBookings();
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="text-4xl font-extrabold mb-2 text-white">Dashboard</h1>
      <p className="text-slate-400 mb-10 text-lg">Welcome back, {user.name}!</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-panel p-8 col-span-1 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[--color-primary] rounded-full blur-[100px] opacity-20 -z-10" />
          <h2 className="text-2xl font-bold mb-6 text-[--color-secondary] flex items-center">
            <span className="mr-3">📅</span> Your Upcoming Bookings
          </h2>
          
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking: any) => (
                <div key={booking._id} className="p-5 bg-[--color-card-border] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 border border-transparent hover:border-[--color-primary]/30">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-xl font-bold text-white mb-1">{booking.venueId?.name || 'Venue Name'}</h3>
                    <p className="text-slate-400 flex items-center">
                      <span className="mr-2">🗓️</span> {booking.date} 
                      <span className="mx-2">•</span> 
                      <span className="mr-2">⏰</span> {booking.timeSlot}
                    </p>
                  </div>
                  <button className="text-slate-400 hover:text-white text-sm font-semibold px-4 py-2 bg-slate-800/50 rounded-lg transition-colors border border-slate-700 hover:border-slate-500">
                    Cancel Booking
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 py-12 text-center bg-[--color-card-border] rounded-2xl border flex flex-col items-center justify-center border-slate-800">
              <div className="text-5xl mb-4">🏟️</div>
              <p className="mb-6 text-lg font-medium text-slate-300">No upcoming bookings currently.</p>
              <Link href="/explore">
                <button className="glass-button px-6 py-2">
                  Find a Venue
                </button>
              </Link>
            </div>
          )}
        </div>
        
        <div className="glass-panel p-8 relative overflow-hidden">
           <div className="absolute bottom-0 left-0 w-40 h-40 bg-[--color-accent] rounded-full blur-[100px] opacity-20 -z-10" />
          <h2 className="text-xl font-bold mb-6 text-[--color-accent] flex items-center">
             <span className="mr-3">⚡</span> Quick Actions
          </h2>
          <div className="space-y-4 flex flex-col">
            <Link href="/explore">
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[--color-card-border] hover:bg-[--color-card-glass] transition-all font-semibold text-slate-200 border border-transparent hover:border-[--color-secondary] group">
                <span className="flex items-center"><span className="text-2xl mr-3 group-hover:scale-110 transition-transform">🔍</span> Find a Venue</span>
                <span className="text-slate-500 group-hover:text-[--color-secondary]">&rarr;</span>
              </button>
            </Link>
            <Link href="/games">
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[--color-card-border] hover:bg-[--color-card-glass] transition-all font-semibold text-slate-200 border border-transparent hover:border-[--color-primary] group">
                <span className="flex items-center"><span className="text-2xl mr-3 group-hover:scale-110 transition-transform">🎮</span> Join a Game</span>
                <span className="text-slate-500 group-hover:text-[--color-primary]">&rarr;</span>
              </button>
            </Link>
            <Link href="/chat">
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[--color-card-border] hover:bg-[--color-card-glass] transition-all font-semibold text-slate-200 border border-transparent hover:border-[--color-accent] group">
                <span className="flex items-center"><span className="text-2xl mr-3 group-hover:scale-110 transition-transform">💬</span> Messages</span>
                <span className="text-slate-500 group-hover:text-[--color-accent]">&rarr;</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
