'use client';

import React from 'react';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Sparkles, PenLine } from 'lucide-react';

export const DailyQuestion: React.FC = () => {
  return (
    <div className="glass p-6 rounded-3xl relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          <span>Daily Prompt</span>
        </div>

        <div className="space-y-2">
          <Heading level={3} className="font-serif leading-tight">
            What is a burden you are ready to put down today?
          </Heading>
          <Text muted size="sm">
            124 others are reflecting on this right now.
          </Text>
        </div>

        <Button className="w-full justify-between group-hover:bg-primary group-hover:text-white transition-colors">
          <span>Write your answer</span>
          <PenLine className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
