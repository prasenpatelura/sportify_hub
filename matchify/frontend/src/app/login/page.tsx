'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function Login() {
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
      const res = await api.post('/auth/login', { email, password });
      const userData = res.data.user || res.data;
      setUser(userData, userData.token || res.data.token || 'mock-jwt-token');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
      <div className="glass-panel p-8 md:p-12 max-w-md w-full animate-fade-in relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[--color-primary] rounded-full blur-[80px] opacity-50 -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[--color-secondary] rounded-full blur-[80px] opacity-50 -z-10" />
        
        <h2 className="text-3xl font-bold mb-2 text-white">Welcome Back</h2>
        <p className="text-slate-400 mb-8">Login to your Matchify account</p>
        
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
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
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center mt-8 text-slate-400 text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-[--color-secondary] hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
