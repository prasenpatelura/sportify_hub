'use client';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-10">
      
      {/* Header Profile Card */}
      <div className="glass-panel p-8 flex flex-col items-center justify-center text-center relative overflow-hidden text-white border-t-2 border-[--color-primary]">
         <div className="absolute top-0 w-64 h-64 bg-[--color-primary] opacity-20 blur-[100px] rounded-full -z-10" />
         
         <div className="w-32 h-32 bg-slate-800 flex items-center justify-center rounded-full text-5xl border-4 border-[--color-secondary] shadow-[0_0_20px_rgba(0,212,255,0.3)] mb-6">
            👤
         </div>
         
         <h1 className="text-4xl font-extrabold tracking-tight">{user.name}</h1>
         <p className="text-slate-300 font-medium text-lg mt-1">{user.email}</p>
         
         <div className="mt-8 flex gap-4">
            <div className="px-6 py-2 bg-black/30 rounded-full border border-slate-700">
               <span className="text-slate-400 text-xs font-bold uppercase mr-2">Level</span>
               <span className="text-xl font-black text-neon-primary">{user.level ?? 1}</span>
            </div>
            <div className="px-6 py-2 bg-black/30 rounded-full border border-slate-700">
               <span className="text-slate-400 text-xs font-bold uppercase mr-2">XP</span>
               <span className="text-xl font-black text-neon-secondary">{user.xp ?? 0}</span>
            </div>
         </div>
      </div>

      {/* Badges */}
      <div className="glass-panel p-8">
         <h2 className="text-2xl font-bold text-white mb-6">Achievements</h2>
         <div className="flex flex-wrap gap-4">
            {(user.badges?.length ? user.badges : ['First Login']).map((badge: string, idx: number) => (
              <div key={idx} className="flex flex-col items-center justify-center p-6 bg-slate-800/40 border border-slate-700 rounded-xl w-32 hover:scale-105 hover:border-[--color-secondary] transition-all">
                 <span className="text-4xl mb-3">🏅</span>
                 <p className="text-xs font-bold text-center text-slate-300 uppercase leading-tight">{badge}</p>
              </div>
            ))}
         </div>
      </div>

      {/* Actions */}
      <div className="pt-6 border-t border-slate-800 flex justify-center">
         <button onClick={handleLogout} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-600">
            Sign Out
         </button>
      </div>
    </div>
  );
}
