import client from '@/api/client';
import { ShareDTO } from '../types'; 

// Note: Direct import from 'packages/types/src' to avoid build issues if package.json exports aren't perfect in dev.
// In a stricter monorepo setup, this should be '@webelong/types' or similar, but following existing patterns.
// If the previous analysis showed `packages/types/src/index.ts` exists, we can import from there.

export const getShares = async (cursor?: string): Promise<ShareDTO[]> => {
  const response = await client.get('/v1/shares', {
    params: {
      cursor,
      limit: 20, // Default limit, can be adjusted or passed as param if needed
    },
  });
  return response.data;
};
