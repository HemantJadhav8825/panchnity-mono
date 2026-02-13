'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Aura } from '@/components/ui/Aura';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOODS = [
  { id: 'peaceful', label: 'Peaceful', color: '#60A5FA' },
  { id: 'anxious', label: 'Anxious', color: '#FCD34D' },
  { id: 'sad', label: 'Sad', color: '#818CF8' },
  { id: 'grounded', label: 'Grounded', color: '#34D399' },
  { id: 'overwhelmed', label: 'Overwhelmed', color: '#F87171' },
  { id: 'loved', label: 'Loved', color: '#F472B6' },
];

export const MoodCheckIn: React.FC<{ onComplete: (mood: string) => void }> = ({ onComplete }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  return (
    <div className="w-full max-w-lg mx-auto p-8 glass rounded-3xl space-y-8">
      <div className="space-y-2 text-center">
        <Heading level={3}>How do you feel?</Heading>
        <Text muted>Take a moment to check in with yourself.</Text>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => setSelectedMood(mood.id)}
            className={cn(
              "p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all duration-300 cursor-pointer",
              selectedMood === mood.id 
                ? "bg-primary/10 border-primary shadow-lg scale-[1.02]" 
                : "bg-background border-text/5 hover:border-primary/20"
            )}
          >
            <div 
              className="w-12 h-12 rounded-full blur-md opacity-40 shrink-0"
              style={{ backgroundColor: mood.id === selectedMood ? mood.color : '#94A3B8' }}
            />
            <Text weight="semibold" className={cn(selectedMood === mood.id ? "text-primary" : "text-text/60")}>
              {mood.label}
            </Text>
          </button>
        ))}
      </div>

      <div className="pt-4">
        <Button 
          fullWidth 
          disabled={!selectedMood}
          size="lg"
          onClick={() => selectedMood && onComplete(selectedMood)}
        >
          Complete Check-in
        </Button>
      </div>
    </div>
  );
};
