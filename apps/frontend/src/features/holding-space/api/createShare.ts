import client from '@/api/client';
import { ShareDTO } from '../types';

interface CreateShareParams {
  content: string;
  visibility: 'public' | 'followers';
  anonymous: boolean;
  sensitivityTags: string[];
}

export const createShare = async (params: CreateShareParams): Promise<ShareDTO> => {
  const response = await client.post('/v1/shares', params);
  return response.data;
};
