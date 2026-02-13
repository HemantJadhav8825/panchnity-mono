import client from './client';
import { User } from './auth.service';

export const userService = {
  async listUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    const response = await client.get('/v1/users', {
      params: { limit, offset }
    });
    return response.data;
  },

  async getProfile(id: string): Promise<User> {
    const response = await client.get(`/v1/users/${id}`);
    return response.data;
  },

  async me(): Promise<User> {
    const response = await client.get('/v1/users/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await client.patch('/v1/users/profile', data);
    return response.data;
  }
};
