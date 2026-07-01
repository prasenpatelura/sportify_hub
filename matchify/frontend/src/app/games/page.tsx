'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function GamesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    const fetchGames = async () => {
      try {
        const res = await api.get('/games');
        setGames(Array.isArray(res?.data) ? (res.data as any[]) : []);
      } catch (err) {
        console.error('Failed to fetch games', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [user, router]);

  const handleJoin = async (gameId: string) => {
    try {
      await api.post(`/games/${gameId}/join`, { userId: user._id });
      alert('Joined game successfully!');
      // Refresh games list
      const res = await api.get('/games');
      setGames(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to join game');
    }
  };

  const handleBalance = async (gameId: string) => {
    try {
       const res = await api.post(`/games/team-balance/${gameId}`, {});
       alert(`Teams Balanced Successfully! (Score Differential: ${res.data.balanceScore})\n\nTeam A: ${res.data.teamA.join(', ')}\nTeam B: ${res.data.teamB.join(', ')}`);
    } catch (err: any) {
       alert(err.response?.data?.message || 'Failed to balance teams');
    }
  };

  const handleQuickPlay = async () => {
    try {
      const res = await api.post(`/games/quick-join`, { userId: user._id, sport: 'Football' });
      alert(res.data.message);
      // Refresh games to show joined state
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Quick Play failed. No games available.');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
             Matchmaking <span className="bg-gradient-to-r from-[--color-primary] to-[--color-secondary] text-transparent bg-clip-text">Hub</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Connect with players, auto-balance teams, and jump into matches instantly.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={handleQuickPlay}
                className="glass-button-outline px-6 py-3 flex items-center gap-2 border-[--color-secondary] text-[--color-secondary] hover:bg-[--color-secondary]/10 transition-colors animate-pulse hover:animate-none"
            >
                <span>⚡</span> Quick Play
            </button>
            <button className="glass-button px-6 py-3 shadow-[0_0_20px_rgba(108,92,231,0.4)] hover:shadow-[0_0_30px_rgba(108,92,231,0.6)] flex items-center gap-2">
                <span>➕</span> Host a Game
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[--color-primary]"></div>
        </div>
      ) : (
        <div className="space-y-12">
            {/* Host Tools Section */}
            <div className="glass-panel p-6 border-l-4 border-[--color-accent]">
               <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">🛠️ Organizer Tools</h2>
               <div className="flex flex-wrap gap-4">
                  <button onClick={() => handleBalance(games[0]?._id)} className="px-6 py-3 bg-[--color-card-glass] border border-[--color-accent]/50 hover:bg-[--color-accent]/20 rounded-xl text-white font-bold transition-all text-sm flex items-center gap-2">
                     ⚖️ Smart Balance Active Match
                  </button>
                  <button className="px-6 py-3 bg-[--color-card-glass] border border-orange-500/50 hover:bg-orange-500/20 rounded-xl text-white font-bold transition-all text-sm flex items-center gap-2">
                     🚨 Request Last-Minute Fill
                  </button>
               </div>
            </div>

            {/* General Open Games */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6">Upcoming Matches</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game: any) => {
                    const isFull = game.players.length >= game.maxPlayers;
                    const hasJoined = game.players.includes(user._id);

                    return (
                    <div key={game._id} className="glass-panel p-6 flex flex-col justify-between hover:border-[--color-secondary]/40 transition-colors">
                        <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-[--color-primary]/20 text-[--color-primary] font-bold text-xs rounded-full border border-[--color-primary]/30">
                            {game.sport}
                            </span>
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">
                            {game.players.length} / {game.maxPlayers} Players
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{game.venueId?.name || 'Local Venue'}</h3>
                        <div className="text-slate-400 text-sm space-y-2 mb-6">
                            <p className="flex items-center"><span className="mr-2">🗓️</span> {game.date}</p>
                            <p className="flex items-center"><span className="mr-2">⏰</span> {game.time}</p>
                            <p className="flex items-center"><span className="mr-2">👑</span> Hosted by {game.hostId?.name}</p>
                        </div>
                        </div>
                        
                        <button 
                        onClick={() => handleJoin(game._id)}
                        disabled={isFull || hasJoined}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${
                            hasJoined ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            isFull ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                            'bg-[--color-card-border] hover:bg-[--color-secondary]/20 text-[--color-secondary] border border-[--color-secondary]/30 hover:shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                        }`}
                        >
                        {hasJoined ? 'Already Joined' : isFull ? 'Game Full' : 'Join Game'}
                        </button>
                    </div>
                    );
                })}
                {games.length === 0 && (
                    <div className="col-span-1 md:col-span-3 text-center py-20 bg-[--color-card-border] rounded-2xl border border-slate-800">
                    <p className="text-slate-400 text-lg mb-4">No open games available right now.</p>
                    <button className="glass-button px-6 py-2">Host the first game!</button>
                    </div>
                )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
