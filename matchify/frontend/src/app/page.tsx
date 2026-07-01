import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-[100px] -z-10" />
      
      <div className="glass-panel p-12 max-w-4xl w-full">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[--color-primary] to-[--color-secondary]">
          Welcome to Matchify
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          The ultimate platform to discover premium sports venues, book courts in real-time, and connect with players around you.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-10">
          <Link href="/explore">
            <button className="glass-button px-10 py-4 text-lg font-semibold w-full sm:w-auto">
              Explore Venues
            </button>
          </Link>
          <Link href="/login">
            <button className="px-10 py-4 text-lg font-semibold rounded-full border border-[--color-card-border] hover:bg-[--color-card-glass] transition-colors w-full sm:w-auto">
              Login / Sign Up
            </button>
          </Link>
        </div>
      </div>
      
      {/* Features Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-6xl w-full text-left">
        <div className="glass-panel p-6 border-t border-[--color-secondary]">
          <h3 className="text-2xl font-bold mb-3 text-[--color-secondary]">Discover</h3>
          <p className="text-slate-400">Find the best turf, badminton courts, and swimming pools nearby.</p>
        </div>
        <div className="glass-panel p-6 border-t border-[--color-primary]">
          <h3 className="text-2xl font-bold mb-3 text-[--color-primary]">Book</h3>
          <p className="text-slate-400">Reserve your spot instantly with real-time slot availability.</p>
        </div>
        <div className="glass-panel p-6 border-t border-[--color-accent]">
          <h3 className="text-2xl font-bold mb-3 text-[--color-accent]">Play</h3>
          <p className="text-slate-400">Host games, invite friends, and meet new players in your community.</p>
        </div>
      </div>
    </div>
  );
}
