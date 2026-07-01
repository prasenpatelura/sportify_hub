'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import Link from 'next/link';

export default function ActivityPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    api.get('/stats').then(res => setStats(res.data)).catch(() => {
      setStats({
        matchesPlayed: 0,
        winRate: 0,
        xpEarned: 0,
        history: [],
      });
    });
  }, []);

  if (!user || !stats) return (
     <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[--color-primary]"></div>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-10">
      <h1 className="text-4xl font-extrabold text-white">Your Activity</h1>
      <p className="text-slate-400 mt-2 text-lg">Track your performance and XP journey.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 border-t-4 border-[--color-accent] text-center">
           <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Matches Played</h3>
           <p className="text-5xl font-black text-white">{stats.matchesPlayed}</p>
        </div>
        <div className="glass-panel p-6 border-t-4 border-[--color-primary] text-center">
           <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Win Rate</h3>
           <p className="text-5xl font-black text-white">{stats.winRate}%</p>
        </div>
        <div className="glass-panel p-6 border-t-4 border-[--color-secondary] text-center">
           <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Total XP Earned</h3>
           <p className="text-5xl font-black text-neon-secondary">{stats.xpEarned}</p>
        </div>
      </div>

      <div className="glass-panel p-6">
         <h2 className="text-2xl font-bold text-white mb-6">Recent Match History</h2>
         <div className="space-y-4 rounded-xl overflow-hidden">
            {stats.history.map((h: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-slate-800/40 hover:bg-slate-800 transition-colors border-l-4 border-transparent hover:border-[--color-primary]">
                 <div>
                    <h4 className="font-bold text-white text-lg">{h.sport} Match</h4>
                    <p className="text-slate-400 text-sm">🗓️ {h.date}</p>
                 </div>
                 <div className="text-right">
                    <span className={`px-3 py-1 text-xs font-bold uppercase rounded-md ${h.result === 'Win' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                      {h.result}
                    </span>
                    <p className="text-[--color-primary] font-black text-sm mt-2">{h.xpChange} XP</p>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
