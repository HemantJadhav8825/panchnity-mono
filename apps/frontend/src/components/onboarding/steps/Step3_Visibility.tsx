'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';

export type VisibilitySetting = 'ghost' | 'visible';

interface Step3VisibilityProps {
  onNext: (visibility?: VisibilitySetting) => void;
}

export const Step3_Visibility: React.FC<Step3VisibilityProps> = ({ onNext }) => {
  const [preference, setPreference] = useState<VisibilitySetting | null>(null);

  const handleContinue = () => {
    // If user selected something, pass it.
    // If not, pass nothing (same as skip).
    if (preference) {
      onNext(preference);
    } else {
      onNext();
    }
  };

  const handleSkip = () => {
    onNext();
  };

  const options: { id: VisibilitySetting; label: string; helper: string }[] = [
    { 
      id: 'ghost', 
      label: 'Stay anonymous', 
      helper: 'Share without being seen.' 
    },
    { 
      id: 'visible', 
      label: 'Be visible to others', 
      helper: 'Connect openly.' 
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Header Section */}
      <div className="space-y-4 mb-10 text-center">
        <Heading level={2} className="font-light tracking-tight text-2xl md:text-3xl text-primary/90">
          How visible do you want to be right now?
        </Heading>
        <Text className="text-base text-muted-foreground/80">
          You can change this anytime.
        </Text>
      </div>

      {/* 2. Options Grid */}
      <div className="w-full grid gap-4 mb-12">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setPreference(option.id)}
            className={`
              w-full p-6 text-left border rounded-xl transition-all duration-200 group
              ${preference === option.id 
                ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' 
                : 'border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30'}
            `}
          >
            <div className="flex flex-col gap-1">
              <span className={`text-lg font-normal ${preference === option.id ? 'text-primary' : 'text-foreground/90'}`}>
                {option.label}
              </span>
              <span className={`text-sm ${preference === option.id ? 'text-primary/70' : 'text-muted-foreground'}`}>
                {option.helper}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 3. Actions */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button 
          onClick={handleContinue}
          size="lg"
          variant={preference ? 'default' : 'secondary'}
          className="w-full text-lg h-12 rounded-full transition-all"
        >
          Continue
        </Button>
        
        <button 
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 outline-none focus:ring-2 focus:ring-primary/20 rounded-md"
        >
          Skip
        </button>
      </div>

    </div>
  );
};
