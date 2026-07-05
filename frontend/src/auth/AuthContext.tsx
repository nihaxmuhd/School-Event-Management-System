import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, type AuthUser } from '../api/auth';
import { tokenStorage } from '../api/client';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const access = tokenStorage.getAccessToken();
    if (!access) {
      setUser(null);
      return;
    }
    const current = await authService.me();
    setUser(current);
  };

  useEffect(() => {
    (async () => {
      try {
        await refreshUser();
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password });
    tokenStorage.setTokens(response.access, response.refresh);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authService.logout(tokenStorage.getRefreshToken());
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
