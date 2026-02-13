import client from '@/api/client';
import { CommentDTO } from '../types';

export const getComments = async (shareId: string): Promise<CommentDTO[]> => {
  const response = await client.get(`/v1/shares/${shareId}/comments`);
  return response.data;
};
