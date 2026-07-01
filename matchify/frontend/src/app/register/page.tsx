'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const userData = res.data.user || res.data;
      setUser(userData, userData.token || res.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
      <div className="glass-panel p-8 md:p-12 max-w-md w-full animate-fade-in relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[--color-primary] rounded-full blur-[80px] opacity-30 -z-10" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[--color-accent] rounded-full blur-[80px] opacity-30 -z-10" />
        
        <h2 className="text-3xl font-bold mb-2 text-white">Create Account</h2>
        <p className="text-slate-400 mb-8">Join the Matchify community</p>
        
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[--color-card-border] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[--color-secondary] transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[--color-card-border] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[--color-secondary] transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[--color-card-border] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[--color-secondary] transition-colors"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center mt-8 text-slate-400 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-[--color-secondary] hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
