'use client';

import { useState } from 'react';
import { moderationService } from '@/api/moderation.service';

interface BlockUserButtonProps {
  userId: string;
  userName: string;
  isBlocked: boolean;
  onBlockChange?: (isBlocked: boolean) => void;
}

export function BlockUserButton({
  userId,
  userName,
  isBlocked,
  onBlockChange,
}: BlockUserButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBlock = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await moderationService.blockUser(userId);
      onBlockChange?.(true);
      setShowConfirm(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to block user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnblock = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await moderationService.unblockUser(userId);
      onBlockChange?.(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to unblock user');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isBlocked) {
    return (
      <div>
        <button
          onClick={handleUnblock}
          disabled={isProcessing}
          className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Unblocking...' : 'Unblock User'}
        </button>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}
      </div>
    );
  }

  if (showConfirm) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-sm font-medium mb-3">
          Block <strong>{userName}</strong>?
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
          You won&apos;t be able to message each other. This action is reversible.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isProcessing}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleBlock}
            disabled={isProcessing}
            className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Blocking...' : 'Block'}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
    >
      Block User
    </button>
  );
}
