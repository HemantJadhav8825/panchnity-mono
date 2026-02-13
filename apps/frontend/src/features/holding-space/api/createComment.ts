import client from '@/api/client';
import { CommentDTO } from '../types';

export const createComment = async (shareId: string, content: string): Promise<CommentDTO> => {
  const response = await client.post(`/v1/shares/${shareId}/comments`, { content });
  return response.data;
};
