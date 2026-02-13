'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';

interface Step1ArrivalProps {
  onNext: () => void;
}

export const Step1_Arrival: React.FC<Step1ArrivalProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto px-6 animate-in fade-in duration-700">
      <div className="space-y-8 mb-12">
        <Heading level={1} className="font-light tracking-tight text-3xl md:text-4xl text-primary/90">
          You’re here. <br /> That’s enough for now.
        </Heading>
        
        <Text className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          You don’t have to explain yourself. <br />
          You don’t have to share anything yet.
        </Text>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button 
          onClick={onNext}
          size="lg"
          className="w-full text-lg h-12 rounded-full"
        >
          Continue
        </Button>
        
        <button 
          onClick={onNext}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 outline-none focus:ring-2 focus:ring-primary/20 rounded-md"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};
