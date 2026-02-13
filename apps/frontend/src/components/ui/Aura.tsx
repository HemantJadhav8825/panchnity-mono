'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuraProps {
  color?: string;
  size?: number | string;
  isPulsing?: boolean;
  className?: string;
}

export const Aura: React.FC<AuraProps> = ({ 
  color = '#60A5FA', 
  size = 300, 
  isPulsing = true, 
  className 
}) => {
  return (
    <div 
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: color }}
        animate={isPulsing ? {
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute inset-4 rounded-full blur-2xl opacity-40"
        style={{ backgroundColor: color }}
        animate={isPulsing ? {
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.5, 0.4],
        } : {}}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <div 
        className="relative z-10 w-1/2 h-1/2 rounded-full glass"
        style={{ backgroundColor: `${color}20` }}
      />
    </div>
  );
};
