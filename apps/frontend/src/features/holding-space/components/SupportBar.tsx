'use client';

import React, { useState } from 'react';
import { SupportType } from '../types';
import { Heart, Hand, Zap, Shield, Sparkles } from 'lucide-react'; 
import { Button } from '@/components/ui/Button';
import { toggleSupport, removeSupport } from '../api/toggleSupport';

// Mapping icons to types
const SUPPORT_ICONS = {
  [SupportType.HEARD]: { icon: Sparkles, color: 'text-amber-500' }, 
  [SupportType.HUG]: { icon: Heart, color: 'text-rose-500' },
  [SupportType.SOLIDARITY]: { icon: Hand, color: 'text-blue-500' },
  [SupportType.PRAYER]: { icon: Shield, color: 'text-purple-500' }, // Using Shield as proxy for prayer/safe space
};

interface SupportBarProps {
  shareId: string;
  initialUserSupport?: SupportType;
}

export const SupportBar: React.FC<SupportBarProps> = ({ shareId, initialUserSupport }) => {
  const [currentSupport, setCurrentSupport] = useState<SupportType | undefined>(initialUserSupport);
  const [loading, setLoading] = useState(false);

  const handleSupport = async (type: SupportType) => {
    if (loading) return;
    
    // Toggle logic
    const isRemoving = currentSupport === type;
    const newSupport = isRemoving ? undefined : type;

    // 1. Optimistic Update
    const prevSupport = currentSupport;
    setCurrentSupport(newSupport);

    try {
      setLoading(true);
      if (isRemoving) {
        await removeSupport(shareId);
      } else {
        await toggleSupport(shareId, type);
      }
    } catch (error) {
      console.error('Failed to update support', error);
      // 2. Rollback
      setCurrentSupport(prevSupport);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row items-center gap-1">
      {(Object.keys(SUPPORT_ICONS) as SupportType[]).map((type) => {
        const { icon: Icon, color } = SUPPORT_ICONS[type];
        const isSelected = currentSupport === type;

        return (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            onClick={() => handleSupport(type)}
            className={`
              h-8 w-8 p-0 rounded-full transition-all duration-200
              ${isSelected ? `bg-secondary/50 ${color}` : 'text-muted-foreground hover:text-foreground'}
            `}
            title={type.toLowerCase()}
          >
            <Icon size={18} fill={isSelected ? 'currentColor' : 'none'} />
          </Button>
        );
      })}
    </div>
  );
};
