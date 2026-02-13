'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';

interface Step5CompletionProps {
  onNext: () => void;
}

export const Step5_Completion: React.FC<Step5CompletionProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto px-6 animate-in fade-in duration-1000">
      <div className="space-y-6 mb-12">
        <Heading level={1} className="font-light tracking-tight text-3xl md:text-4xl text-primary/90">
          You’re not late. <br />
          You’re not behind.
        </Heading>
        
        <Text className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          You’re welcome here.
        </Text>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button 
          onClick={onNext}
          size="lg"
          className="w-full text-lg h-12 rounded-full"
        >
          Enter
        </Button>
      </div>
    </div>
  );
};
