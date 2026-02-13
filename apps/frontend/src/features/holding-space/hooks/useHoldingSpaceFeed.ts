import { useState, useEffect, useCallback } from 'react';
import { ShareDTO } from '../types';
import { getShares } from '../api/getShares';
import { useAuth } from '@/context/AuthContext';

export const useHoldingSpaceFeed = () => {
  const { user } = useAuth();
  const [shares, setShares] = useState<ShareDTO[]>([]);
  const [loading, setLoading] = useState(true); // Initial load
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const fetchShares = useCallback(async (currentCursor?: string) => {
    try {
      const newShares = await getShares(currentCursor);
      
      if (newShares.length === 0) {
        setHasMore(false);
      } else {
        setShares((prev) => {
          // Process new shares to add ownership flag
          const processedNewShares = newShares.map(share => ({
            ...share,
            isOwner: user?.id === share.authorId
          }));

          // Defensive: Ensure no duplicates and strict sort by createdAt DESC
          const allShares = currentCursor ? [...prev, ...processedNewShares] : processedNewShares;
          const uniqueShares = Array.from(new Map(allShares.map((item) => [item.id, item])).values());
          // Sort only on fetch
          return uniqueShares.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
        
        // Assuming the backend supports cursor pagination via the last item's ID or createdAt.
        // Since I don't have the full backend response structure (metadata), I'll assume standard cursor logic
        // where I use the last item's ID as the next cursor.
        // If the backend returns a specific 'nextCursor' field, I would use that. 
        // For now, I'll use the ID of the last item.
        setCursor(newShares[newShares.length - 1].id);
      }
    } catch (err) {
      console.error('Failed to fetch holding space shares:', err);
      setError('Failed to load shares.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && cursor) {
      fetchShares(cursor);
    }
  }, [loading, hasMore, cursor, fetchShares]);

  // --- Optimistic UI Helpers ---

  const addOptimisticShare = useCallback((share: ShareDTO) => {
    // Optimistic share is always owned by current user
    setShares((prev) => [{ ...share, isOwner: true }, ...prev]);
  }, []);

  const replaceShare = useCallback((tempId: string, realShare: ShareDTO) => {
    setShares((prev) =>
      prev.map((s) => (s.id === tempId ? { ...realShare, isOwner: true } : s))
    );
  }, []);

  const removeShare = useCallback((id: string) => {
    setShares((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const restoreShare = useCallback((share: ShareDTO, index: number) => {
    setShares((prev) => {
      const newShares = [...prev];
      // ROLLBACK STRATEGY: Insert at specific index, do NOT re-sort.
      // This ensures if we delete item at index 5, it goes back to index 5
      // regardless of timestamp quirks.
      if (index >= 0 && index <= newShares.length) {
        newShares.splice(index, 0, share);
      } else {
        // Fallback: append if index is out of bounds (shouldn't happen)
        newShares.push(share);
      }
      return newShares;
    });
  }, []);

  return {
    shares,
    loading,
    error,
    hasMore,
    loadMore,
    addOptimisticShare,
    replaceShare,
    removeShare,
    updateShareInState: replaceShare,
    deleteShareFromState: removeShare,
    restoreShare, // Exported for rollback
  };
};
