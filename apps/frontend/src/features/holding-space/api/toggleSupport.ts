import client from '@/api/client';
import { SupportType } from '../types';

export const toggleSupport = async (shareId: string, type: SupportType): Promise<void> => {
  await client.post(`/v1/shares/${shareId}/support`, { type });
};

export const removeSupport = async (shareId: string): Promise<void> => {
  await client.delete(`/v1/shares/${shareId}/support`);
};
