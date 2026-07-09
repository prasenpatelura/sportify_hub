import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiSignup, apiLogin, setAuthToken } from '../services/backendApi';

export interface UserProfile {
  uid: string;
  name: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  streak: number;
  matches: number;
  winRate: string;
  tournaments: number;
}

interface AuthUser {
  uid: string;
  username: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (username: string, password: string, name?: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
}

const STORAGE_KEY = 'sportify_auth';

const toProfile = (data: any): UserProfile => ({
  uid: data._id || data.uid || 'unknown',
  name: data.name || 'Player',
  username: data.username || '',
  avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
  level: data.level ?? 1,
  xp: data.xp ?? 0,
  nextLevelXp: (data.level ?? 1) * 1000,
  streak: data.streak ?? 0,
  matches: data.matchesPlayed ?? data.matches ?? 0,
  winRate: data.winRate !== undefined ? `${Math.round(data.winRate)}%` : '0%',
  tournaments: data.tournaments ?? 0,
});

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) {
          const { token, profile } = JSON.parse(raw);
          setAuthToken(token);
          setUser({ uid: profile.uid, username: profile.username });
          setUserProfile(profile);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const persist = async (token: string | null, profile: UserProfile) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token, profile }));
  };

  const applyAuthResponse = async (data: any) => {
    const token = data.token;
    const profile = toProfile(data);
    setAuthToken(token);
    setUser({ uid: profile.uid, username: profile.username });
    setUserProfile(profile);
    await persist(token, profile);
  };

  const signUp = async (username: string, password: string, name?: string) => {
    const data = await apiSignup(username, password, name);
    await applyAuthResponse(data);
  };

  const signIn = async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    await applyAuthResponse(data);
  };

  const logout = async () => {
    setAuthToken(null);
    setUser(null);
    setUserProfile(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = async (patch: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      AsyncStorage.getItem(STORAGE_KEY).then(raw => {
        const token = raw ? JSON.parse(raw).token : null;
        persist(token, next);
      });
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUp, signIn, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
