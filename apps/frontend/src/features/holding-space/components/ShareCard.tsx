'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShareDTO } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { SensitivityBlurWrapper } from './SensitivityBlurWrapper';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { AnonymousAvatar } from '@/components/ui/anonymous-avatar';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { useAuth } from '@/context/AuthContext';
import { MoreVertical, Edit2, Trash2, X, Check, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

/**
 * HOLDING SPACE RULE:
 * Never render engagement counts.
 * Never introduce ranking UI.
 * Never introduce trending or popularity surfaces.
 */

interface ShareCardProps {
  share: ShareDTO;
  onUpdate?: (id: string, content: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const ShareCard: React.FC<ShareCardProps> = ({ share, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(share.content);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Author check
  const isAuthor = !!share.isOwner;
  const isAnonymous = share.authorId === 'anonymous' || share.anonymous;
  
  const displayName = isAnonymous ? 'Anonymous' : 'Community Member';
  
  // Create a seed for anonymous avatar if needed
  const avatarSeed = isAnonymous ? `#${share.id.slice(0, 6)}:?` : undefined;

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!editedContent.trim() || !onUpdate) return;
    
    setIsSaving(true);
    try {
      await onUpdate(share.id, editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update share', error);
      // Parent handles toast/rollback, we just stop loading
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(share.id);
      // Component will likely unmount
    } catch (error) {
      console.error('Failed to delete share', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderMenu = () => {
    if (!isAuthor || !onUpdate || !onDelete) return null;

    return (
      <div className="relative transform translate-x-2" ref={menuRef}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-full" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <MoreVertical size={16} className="text-muted-foreground" />
        </Button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-1 w-32 bg-card border shadow-md rounded-md z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <button 
              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center gap-2"
              onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
            >
              <Edit2 size={14} /> Edit
            </button>
            <button 
              className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
              onClick={() => { setShowDeleteConfirm(true); setIsMenuOpen(false); }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-3 animate-in fade-in duration-200">
          <Textarea 
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[120px] resize-none"
            placeholder="Share your thoughts..."
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => { setIsEditing(false); setEditedContent(share.content); }}
              disabled={isSaving}
            >
              <X size={14} className="mr-1" />
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={isSaving || !editedContent.trim()}
            >
              {isSaving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Check size={14} className="mr-1" />}
              Save
            </Button>
          </div>
        </div>
      );
    }

    return (
      <SensitivityBlurWrapper tags={share.sensitivityTags}>
        <p className="text-base leading-loose whitespace-pre-wrap font-heading text-foreground/90 mt-4">
          {share.content}
        </p>
      </SensitivityBlurWrapper>
    );
  };

  if (showDeleteConfirm) {
    return (
      <Card className="mb-4 overflow-hidden border-destructive/30 bg-destructive/5 transition-all">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertTriangle size={20} />
            </div>
            <div className="space-y-1">
                <h3 className="font-medium">Delete this share?</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 w-full justify-center pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 max-w-[120px]"
                >
                    Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 max-w-[120px]"
                >
                    {isDeleting ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                    Delete
                </Button>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 overflow-hidden border-border/40 hover:border-border/60 transition-colors group shadow-sm rounded-2xl">
      <CardHeader className="flex flex-row items-start justify-between p-6 pb-2 space-y-0">
        <div className="flex flex-row items-center gap-3">
          {isAnonymous ? (
              <AnonymousAvatar seed={avatarSeed || '#333:?'} size="sm" />
          ) : (
              <ProfileAvatar size="sm" name={displayName} />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(share.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        {/* Menu */}
        {!isEditing && renderMenu()}

      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
