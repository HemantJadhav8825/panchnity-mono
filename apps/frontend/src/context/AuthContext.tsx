'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, User } from '../api/auth.service';
import { userService } from '../api/user.service';
import { socketService } from '../api/socket.service';
import { subscribeToUnauthorized } from '../api/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  googleLogin: (code: string, redirectUri?: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await userService.me();
      setUser(profile);
      localStorage.setItem('user_hint', JSON.stringify(profile));
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      const userHint = localStorage.getItem('user_hint');

      if (refreshToken) {
        try {
          // 1. (Removed) Optimistic UI update from hint - STRICT AUTH REQUIREMENT
          // We wait for real verification to ensure no stale/invalid user state is ever shown

          // 2. Real verification: Get fresh access token
          await authService.refresh();
          
          // 3. Connect WebSocket
          socketService.connect();
          
          // 4. Fetch fresh user profile
          await fetchProfile();
          
        } catch (e) {
          console.error('Session restoration failed:', e);
          // If refresh fails, clear everything
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_hint');
          setUser(null);
        }
      } else {
        // No tokens found, clean up any stale state
        localStorage.removeItem('user_hint');
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchProfile]);

  const login = useCallback(async (credentials: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      // Store basic user first
      setUser(data.user);
      localStorage.setItem('user_hint', JSON.stringify(data.user));
      
      // Store tokens handled by authService
      
      socketService.connect();
      
      // Fetch full profile
      await fetchProfile();
      
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router, fetchProfile]);

  const googleLogin = useCallback(async (code: string, redirectUri?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.googleLogin(code, redirectUri);
      setUser(data.user);
      localStorage.setItem('user_hint', JSON.stringify(data.user));
      socketService.connect();
      
      // Fetch full profile
      await fetchProfile();
      
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Google login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router, fetchProfile]);

  const signup = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signup(data);
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    socketService.disconnect();
    await authService.logout();
    setUser(null);
    router.push('/login');
  }, [router]);

  // Global logout listener for 401s that fail refresh
  useEffect(() => {
    const unsubscribe = subscribeToUnauthorized(() => {
      logout();
    });
    return unsubscribe;
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        googleLogin,
        signup,
        logout,
        error,
        refreshUser: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
