'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';

export default function ExploreVenues() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await api.get('/venues');
        setVenues(Array.isArray(res?.data) ? (res.data as any[]) : []);
      } catch (err) {
        console.error('Failed to fetch venues', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="text-4xl font-extrabold mb-4 text-white">Explore Venues</h1>
      <p className="text-slate-400 mb-10 text-lg">Find the perfect spot for your next game.</p>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--color-primary]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {venues.map((venue: any) => (
            <div key={venue._id} className="glass-panel overflow-hidden flex flex-col group cursor-pointer border border-[--color-card-border] hover:border-[--color-primary]/50 transition-all duration-300 hover:-translate-y-2">
              <div className="h-48 bg-slate-800 relative w-full overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-[--color-background-start] flex items-center justify-center">
                  <span className="text-5xl">🏟️</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-white mb-2">{venue.name}</h3>
                <p className="text-slate-400 mb-4 flex items-center"><span className="mr-2">📍</span> {venue.location?.address || 'Unknown Location'}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {venue.sports?.map((sport: string) => (
                    <span key={sport} className="px-3 py-1 bg-[--color-secondary]/10 text-[--color-secondary] text-xs font-bold rounded-full border border-[--color-secondary]/20">
                      {sport}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xl font-bold text-white">${venue.pricePerHour}<span className="text-sm text-slate-400 font-normal">/hr</span></span>
                  <Link href={`/venues/${venue._id}`}>
                    <button className="glass-button px-5 py-2.5 text-sm">View Details</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {venues.length === 0 && (
             <div className="col-span-1 md:col-span-3 text-center py-20 bg-[--color-card-border] rounded-2xl border border-slate-800">
               <p className="text-slate-400 text-lg">No venues available at the moment. Please check back later.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
