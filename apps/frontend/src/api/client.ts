import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';

/**
 * In-memory token storage for maximum security.
 * This is lost on page refresh, triggering a refresh flow.
 */
let accessToken: string | null = null;
let isRefreshing = false;

type TokenSubscriber = (token: string) => void;
type UnauthorizedSubscriber = () => void;

let refreshSubscribers: TokenSubscriber[] = [];
let unauthorizedSubscribers: UnauthorizedSubscriber[] = [];

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const subscribeToUnauthorized = (cb: UnauthorizedSubscriber) => {
  unauthorizedSubscribers.push(cb);
  return () => {
    unauthorizedSubscribers = unauthorizedSubscribers.filter((sub) => sub !== cb);
  };
};

const onUnauthorized = () => {
  unauthorizedSubscribers.forEach((cb) => cb());
};

const subscribeTokenRefresh = (cb: TokenSubscriber) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

const API_URL = env.NEXT_PUBLIC_API_URL;

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and Token Refresh
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until refresh is done
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call the refresh endpoint
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken: newAccessToken } = response.data;

        setAccessToken(newAccessToken);
        onRefreshed(newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed: Logout user
        setAccessToken(null);
        localStorage.removeItem('refresh_token');
        onUnauthorized();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
