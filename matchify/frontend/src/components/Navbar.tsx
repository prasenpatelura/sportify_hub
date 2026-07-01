'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push('/');
  };

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setMenuOpen(false)}
      className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
        pathname === href
          ? 'text-white bg-[--color-primary]/20 border border-[--color-primary]/30'
          : 'text-slate-300 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 glass-panel border-b-0 rounded-none rounded-b-2xl mb-4 mx-2 sm:mx-4 mt-2">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" onClick={() => setMenuOpen(false)}>
              <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[--color-primary] to-[--color-secondary]">
                Matchify
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link href="/explore" className="text-slate-300 hover:text-white px-3 py-2 rounded-md font-medium transition-colors">
                Explore
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="text-slate-300 hover:text-white px-3 py-2 rounded-md font-medium transition-colors">Home</Link>
                  <Link href="/games" className="text-slate-300 hover:text-white px-3 py-2 rounded-md font-medium transition-colors">Play</Link>
                  <Link href="/activity" className="text-slate-300 hover:text-white px-3 py-2 rounded-md font-medium transition-colors">Activity</Link>
                  <Link href="/profile" className="text-slate-300 hover:text-white px-3 py-2 rounded-md font-medium transition-colors">
                    <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-sm">👤</span>
                  </Link>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="glass-button px-6 py-2.5 font-medium">Login / Sign Up</Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden px-3 pb-4 pt-1 space-y-1 border-t border-white/5">
            {navLink('/explore', '🔍 Explore')}
            {user ? (
              <>
                {navLink('/dashboard', '🏠 Home')}
                {navLink('/games', '🎮 Play')}
                {navLink('/activity', '⚡ Activity')}
                {navLink('/profile', '👤 Profile')}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <div className="pt-2">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="glass-button block text-center px-6 py-3 font-medium">
                  Login / Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Mobile bottom navigation bar */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel rounded-none rounded-t-2xl border-t border-white/10 px-2 py-2">
          <div className="flex items-center justify-around">
            {[
              { href: '/dashboard', icon: '🏠', label: 'Home' },
              { href: '/explore', icon: '🔍', label: 'Explore' },
              { href: '/games', icon: '🎮', label: 'Play' },
              { href: '/activity', icon: '⚡', label: 'Activity' },
              { href: '/profile', icon: '👤', label: 'Me' },
            ].map(({ href, icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[52px] ${
                  pathname === href
                    ? 'text-white bg-[--color-primary]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xl leading-none">{icon}</span>
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
