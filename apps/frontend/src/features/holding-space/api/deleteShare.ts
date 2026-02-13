import client from '@/api/client';

export const deleteShare = async (id: string): Promise<void> => {
  await client.delete(`/v1/shares/${id}`);
};
