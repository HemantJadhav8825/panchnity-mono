import axios from 'axios';
import client, { setAccessToken } from './client';
import { env } from '../config/env';

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string; // e.g. "John Doe"
  fullName?: string;
  bio?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  anonymousProfile?: {
    pseudonym: string;
    color: string;
  };
  createdAt?: string;
  hasOnboarded?: boolean;
  onboardingIntent?: string;
  visibility?: 'visible' | 'ghost';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  async login(credentials: any): Promise<AuthResponse> {
    const response = await client.post('/auth/login', credentials);
    const data = response.data;
    
    // Store tokens
    setAccessToken(data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    
    return data;
  },

  async googleLogin(code: string, redirectUri?: string): Promise<AuthResponse> {
    const response = await client.post('/auth/google', { code, redirectUri });
    const data = response.data;
    
    // Store tokens
    setAccessToken(data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    
    return data;
  },

  async signup(data: any): Promise<AuthResponse> {
    const response = await client.post('/auth/register', data);
    const user = response.data;
    
    // After successful registration, we might want to auto-login or redirect to login.
    // The current backend register returns just the user. Let's redirect to login for simplicity
    // or call login automatically if the user provided password.
    return user;
  },

  async logout(): Promise<void> {
    try {
      await client.post('/auth/logout');
    } finally {
      setAccessToken(null);
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_hint');
    }
  },

  async refresh(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await axios.post(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    setAccessToken(accessToken);
    
    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken);
    }
    
    return accessToken;
  }
};
