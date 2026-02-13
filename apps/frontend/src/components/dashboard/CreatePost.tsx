'use client';

import React, { useState } from 'react';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Aura } from '@/components/ui/Aura';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Lock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (content: string, visibility: string, isAnonymous: boolean) => void;
}

const VISIBILITY_OPTIONS = [
  { id: 'community', label: 'Community', icon: Globe, description: 'Shared with the world.' },
  { id: 'circles', label: 'Circles', icon: Shield, description: 'Visible to your safe spaces.' },
  { id: 'private', label: 'Private', icon: Lock, description: 'Only for your eyes.' },
];

export const CreatePost: React.FC<CreatePostProps> = ({ isOpen, onClose, onPost }) => {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('community');
  const [isAnonymous, setIsAnonymous] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-text/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="relative bg-background w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-text/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <Heading level={6}>Share a Reflection</Heading>
                <Text size="xs" muted>Speak your truth at your own pace.</Text>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-text/5 rounded-full transition-colors">
              <X className="w-6 h-6 text-text/40" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Text weight="semibold">Identify as</Text>
                <button 
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300",
                    isAnonymous ? "bg-primary/5 border-primary/20 text-primary" : "border-text/10 text-text/40"
                  )}
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {isAnonymous ? "Anonymous Soul" : "Public Profile"}
                  </span>
                </button>
              </div>
              <Text size="xs" muted className="px-1">
                {isAnonymous 
                  ? "Your post will be shared without your profile details. Safety first."
                  : "Your name and profile will be visible with this reflection."}
              </Text>
            </div>

            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="How are you holding yourself today?"
              className="w-full min-h-[160px] bg-primary/5 rounded-2xl p-6 text-lg font-body focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />

            <div className="space-y-4">
              <Text weight="semibold">Visible to</Text>
              <div className="grid grid-cols-3 gap-3">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setVisibility(opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300",
                      visibility === opt.id ? "bg-primary border-primary text-white" : "border-text/5 text-text/40 hover:border-primary/20"
                    )}
                  >
                    <opt.icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary/5">
            <Button 
              fullWidth 
              size="lg" 
              disabled={!content.trim()}
              onClick={() => onPost(content, visibility, isAnonymous)}
            >
              Share Reflection
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
