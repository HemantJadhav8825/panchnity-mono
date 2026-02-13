import axios from 'axios';
import { AUTH_CONFIG } from './auth.config';

export const AuthProxy = {
  login: async (data: any) => {
    const response = await axios.post(`${AUTH_CONFIG.SERVICE_URL}/v1/auth/login`, data);
    return response.data;
  },

  register: async (data: any) => {
    const response = await axios.post(`${AUTH_CONFIG.SERVICE_URL}/v1/auth/register`, data);
    return response.data;
  },

  refresh: async (data: any) => {
    const response = await axios.post(`${AUTH_CONFIG.SERVICE_URL}/v1/auth/refresh`, data);
    return response.data;
  },

  google: async (data: any) => {
    const response = await axios.post(`${AUTH_CONFIG.SERVICE_URL}/v1/auth/google`, data);
    return response.data;
  }
};
