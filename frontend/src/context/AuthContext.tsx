import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'farmer' | 'researcher' | 'admin';
  subscription: 'free' | 'pro' | 'enterprise';
  region: string;
  phone?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; role?: string; region?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  upgradeSubscription: (planId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Default guest/demo user if not logged in
const DEFAULT_DEMO_USER: User = {
  id: 2,
  email: 'farmer@agrisense.ai',
  full_name: 'Ravi Kishan Sharma',
  role: 'farmer',
  subscription: 'pro',
  region: 'North India',
  phone: '+91 98123 45678'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('agrisense_token');
    const savedUser = localStorage.getItem('agrisense_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(DEFAULT_DEMO_USER);
      }
    } else {
      // Default to demo farmer for seamless exploring
      setUser(DEFAULT_DEMO_USER);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any) => {
    setIsLoading(true);
    try {
      const data = await authApi.register(formData);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setToken(null);
    setUser(DEFAULT_DEMO_USER); // Fallback to demo
  };

  const upgradeSubscription = async (planId: string) => {
    try {
      const updatedUser = await authApi.upgradePlan(planId);
      setUser(updatedUser);
      localStorage.setItem('agrisense_user', JSON.stringify(updatedUser));
    } catch (e) {
      // Offline fallback update
      if (user) {
        const u: User = { ...user, subscription: planId as any };
        setUser(u);
        localStorage.setItem('agrisense_user', JSON.stringify(u));
      }
    }
  };

  const refreshProfile = async () => {
    if (token) {
      try {
        const p = await authApi.getProfile();
        setUser(p);
        localStorage.setItem('agrisense_user', JSON.stringify(p));
      } catch (err) {
        console.error('Failed to refresh user profile:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, upgradeSubscription, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
