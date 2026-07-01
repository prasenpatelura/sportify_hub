'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';

export default function VenueDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await api.get(`/venues/${id}`);
        setVenue(res.data);
      } catch (err) {
        console.error('Failed to fetch venue', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVenue();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!selectedDate || !selectedSlot) {
      setMessage('Please select a date and time slot.');
      return;
    }
    setBookingLoading(true);
    setMessage('');
    try {
      await api.post('/bookings', {
        userId: user._id,
        venueId: venue._id,
        date: selectedDate,
        timeSlot: selectedSlot
      });
      setMessage('✅ Booking confirmed successfully!');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setMessage('Failed to book: ' + (err.response?.data?.message || err.message));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--color-primary]"></div>
      </div>
    );
  }

  if (!venue) {
    return <div className="text-center py-20 text-white text-2xl">Venue not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in flex flex-col lg:flex-row gap-10">
      <div className="flex-1">
        <div className="h-64 sm:h-96 w-full rounded-2xl bg-gradient-to-br from-slate-900 to-[--color-background-start] mb-8 flex items-center justify-center border border-[--color-card-border]">
          <span className="text-6xl text-[--color-primary]/50">🏟️ Venue Image</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">{venue.name}</h1>
        <p className="text-lg text-slate-300 flex items-center mb-6">
          <span className="mr-2">📍</span> {venue.location?.address || 'Location Not Available'}
        </p>
        
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Available Sports</h3>
          <div className="flex flex-wrap gap-3">
            {venue.sports?.map((sport: string) => (
              <span key={sport} className="px-4 py-2 bg-[--color-card-border] border border-[--color-primary]/30 text-white rounded-full text-sm font-medium">
                {sport}
              </span>
            ))}
          </div>
        </div>

        <div>
           <h3 className="text-xl font-bold text-white mb-2">About this Venue</h3>
           <p className="text-slate-400 leading-relaxed text-lg">
             Experience premium sports facilities with top-tier amenities. 
             Perfect for casual games with friends or competitive matches. 
             This venue offers excellently maintained courts and turfs to cater to your sporting needs.
           </p>
        </div>
      </div>

      <div className="w-full lg:w-1/3">
        <div className="glass-panel p-8 sticky top-28">
          <h2 className="text-2xl font-bold text-white mb-2">Book a Court</h2>
          <div className="text-3xl font-extrabold text-[--color-secondary] mb-8">
            ${venue.pricePerHour} <span className="text-base text-slate-400 font-medium">/ hour</span>
          </div>

          {message && (
             <div className="p-4 mb-6 rounded-xl bg-[--color-card-border] text-[--color-accent] border border-[--color-accent]/50 text-sm font-semibold">
               {message}
             </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Date</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[--color-primary] transition-colors"
                title="Select booking date"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Time Slot</label>
              <select 
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[--color-primary] transition-colors"
                title="Select time slot"
              >
                <option value="" className="text-slate-500">Choose a slot...</option>
                {venue.availableSlots?.map((slot: string) => (
                  <option key={slot} value={slot} className="bg-slate-800 text-white">{slot}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleBooking}
              disabled={bookingLoading}
              className="w-full glass-button py-4 text-lg font-bold mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingLoading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
