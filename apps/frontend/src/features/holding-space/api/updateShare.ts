import { ShareDTO } from '../types';
import client from '@/api/client';

export const updateShare = async (id: string, updates: Partial<ShareDTO>): Promise<ShareDTO> => {
  const response = await client.patch<ShareDTO>(`/v1/shares/${id}`, updates);
  return response.data;
};
