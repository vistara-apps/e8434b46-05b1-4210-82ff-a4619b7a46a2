'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/lib/types';
import { authenticateUser, fetchUser } from '@/lib/api';

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (walletAddress: string, telegramId?: string) => Promise<void>;
  logout: () => void;
  updateUserData: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing user session
    const savedUserId = localStorage.getItem('cryptopulse_user_id');
    if (savedUserId) {
      loadUser(savedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await fetchUser(userId);
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user');
      // Clear invalid session
      localStorage.removeItem('cryptopulse_user_id');
    } finally {
      setLoading(false);
    }
  };

  const login = async (walletAddress: string, telegramId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authenticateUser(walletAddress, telegramId);
      setUser(userData);
      localStorage.setItem('cryptopulse_user_id', userData.userId);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('cryptopulse_user_id');
  };

  const updateUserData = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const value: UserContextType = {
    user,
    loading,
    error,
    login,
    logout,
    updateUserData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
