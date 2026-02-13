'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ear, HeartHandshake, Sun, GitCommit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/Text';

export type ReactionType = 'heard' | 'with_you' | 'light' | 'same';

interface ResonanceTrayProps {
  isOpen: boolean;
  onSelect: (type: ReactionType) => void;
  onClose: () => void;
}

const REACTIONS = [
  { 
    id: 'heard', 
    label: 'Heard', 
    description: 'I hear your story.',
    icon: Ear, 
    color: 'text-blue-400', 
    bg: 'bg-blue-400/10' 
  },
  { 
    id: 'with_you', 
    label: 'With You', 
    description: 'Holding space.',
    icon: HeartHandshake, 
    color: 'text-rose-400', 
    bg: 'bg-rose-400/10' 
  },
  { 
    id: 'light', 
    label: 'Light', 
    description: 'Sending warmth.',
    icon: Sun, 
    color: 'text-amber-400', 
    bg: 'bg-amber-400/10' 
  },
  { 
    id: 'same', 
    label: 'Same', 
    description: 'I relate deeply.',
    icon: GitCommit, 
    color: 'text-purple-400', 
    bg: 'bg-purple-400/10' 
  },
] as const;

export const ResonanceTray: React.FC<ResonanceTrayProps> = ({ isOpen, onSelect, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/20 backdrop-blur-[1px]"
            onClick={onClose}
          />

          {/* Tray */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute right-0 bottom-full mb-2 z-50 glass p-2 rounded-2xl flex items-center gap-1 shadow-xl"
          >
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.id}
                onClick={() => onSelect(reaction.id as ReactionType)}
                className={cn(
                  "group relative p-3 rounded-xl transition-all duration-300 hover:scale-110",
                  reaction.bg
                )}
                aria-label={reaction.label}
              >
                <reaction.icon className={cn("w-5 h-5", reaction.color)} />
                
                {/* Tooltip */}
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-text text-background text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {reaction.description}
                </span>
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
