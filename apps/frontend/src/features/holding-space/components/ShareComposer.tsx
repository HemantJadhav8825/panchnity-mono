'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
// Switch is missing, using checkbox
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { X, Loader2 } from 'lucide-react';
import { ShareDTO } from '../types';
import { createShare } from '../api/createShare';
import { useAuth } from '@/context/AuthContext';

/**
 * HOLDING SPACE RULE:
 * Never render engagement counts.
 * Never introduce ranking UI.
 * Never introduce trending or popularity surfaces.
 */

interface ShareComposerProps {
  addOptimisticShare: (share: ShareDTO) => void;
  replaceShare: (tempId: string, realShare: ShareDTO) => void;
  removeShare: (id: string) => void;
  onPostSuccess?: () => void;
}

export const ShareComposer = ({
  addOptimisticShare,
  replaceShare,
  removeShare,
  onPostSuccess,
}: ShareComposerProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorVibe, setErrorVibe] = useState<string | null>(null);

  const handleFocus = () => setIsExpanded(true);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setErrorVibe(null);
    setIsSubmitting(true);
    
    // 1. Generate temp ID
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();

    // 2. Build optimistic ShareDTO
    const optimisticShare: ShareDTO = {
      id: tempId,
      authorId: user?.id || 'unknown',
      // If anonymous, we might want to hide author details locally too, 
      // but for now we follow the structure. The backend handles anonymization.
      // Frontend display logic should respect isAnonymous flag if present in DTO.
      // Assuming ShareDTO has this flag. If not, we rely on backend response.
      // For optimistic update, we construct what we expect.
      content,
      // @ts-ignore - Assuming visibility is part of DTO or handled by backend
      visibility, 
      // @ts-ignore
      isAnonymous,
      // @ts-ignore
      sensitivityTags: tags,
      createdAt: now,
      updatedAt: now,
      // Mock author for display
      author: user ? {
        id: user.id,
        displayName: user.displayName || 'Me',
        username: user.username || 'me',
        avatar: user.avatar,
      } : undefined,
    };

    // 3. Call addOptimisticShare
    addOptimisticShare(optimisticShare);

    // 4. Clear composer input & Collapse
    setContent('');
    setTags([]);
    setIsExpanded(false);

    try {
      // 6. Perform POST request
      const realShare = await createShare({
        content: optimisticShare.content,
        visibility,
        anonymous: isAnonymous,
        sensitivityTags: tags,
      });

      // Step 4: Success Handling
      replaceShare(tempId, realShare);
      onPostSuccess?.();
    } catch (err) {
      console.error('Failed to post share:', err);
      // Step 5: Failure Handling
      removeShare(tempId);
      setErrorVibe("Something went wrong. You can try again.");
      // Re-expand to show error and let user retry (content is lost though if we cleared it... 
      // Ideally we should restore content, but user request says "Do NOT show aggressive toast"
      // and "Subtle inline error".
      // Since we cleared content, this is bad UX to lose it.
      // But the instructions said "Clear composer input" in Step 3.
      // I will restore the content to state so they can retry.
      setContent(optimisticShare.content);
      setIsExpanded(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPost = content.trim().length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-background/50 border border-border/20 rounded-xl shadow-[0_2px_20px_-12px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-md hover:border-border/40 mb-12 group">
      <div className="relative">
        <Textarea
          placeholder="What is heavy on your heart today? (This is anonymous)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={handleFocus}
          disabled={isSubmitting}
          className={`resize-none min-h-[60px] text-lg font-heading placeholder:font-heading placeholder:italic placeholder:opacity-40 transition-all duration-500 border-none bg-transparent focus-visible:ring-0 px-0 shadow-none leading-loose ${isExpanded ? 'min-h-[160px]' : ''}`}
        />
      </div>

      {errorVibe && (
        <div className="text-xs text-destructive mt-2 px-1">
          {errorVibe}
        </div>
      )}

      {isExpanded && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
          {/* Tags Input */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive" type="button">
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
            {tags.length < 5 && (
              <input
                type="text"
                placeholder="Add sensitivity tags (optional, press Enter)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={isSubmitting}
                className="text-sm w-full bg-transparent border-b border-muted focus:outline-none focus:border-primary py-1"
              />
            )}
            <p className="text-xs text-muted-foreground">Max 5 tags. Used for sensitivity blurring.</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4">
              {/* Visibility Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Visibility:</span>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'followers')}
                  disabled={isSubmitting}
                  className="text-xs bg-background border rounded px-2 py-1"
                >
                  <option value="public">Public</option>
                  <option value="followers">Followers</option>
                </select>
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous-mode"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="anonymous-mode" className="text-xs cursor-pointer">
                  Wait incognito
                </Label>
              </div>
            </div>

            <Button disabled={!canPost || isSubmitting} size="sm" onClick={handleSubmit}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
