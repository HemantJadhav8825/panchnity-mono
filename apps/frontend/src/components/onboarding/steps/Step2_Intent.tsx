'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';

// Define the intents locally or import from a shared types file if one existed.
// Given strict instructions to not "invent" outside scope, we define type here for props.
export type OnboardingIntent = 'listen' | 'share' | 'just_be';

interface Step2IntentProps {
  onNext: (intent?: OnboardingIntent) => void;
}

export const Step2_Intent: React.FC<Step2IntentProps> = ({ onNext }) => {
  const [selectedIntent, setSelectedIntent] = useState<OnboardingIntent | null>(null);

  const handleContinue = () => {
    // If nothing selected, treated same as skip (per contract: no validation errors)
    // but UX usually implies Continue submits selection if made.
    if (selectedIntent) {
      onNext(selectedIntent);
    } else {
      onNext(); // Treat as skip/no-intent
    }
  };

  const handleSkip = () => {
    onNext();
  };

  const options: { id: OnboardingIntent; label: string }[] = [
    { id: 'listen', label: 'I want to listen' },
    { id: 'share', label: 'I want to share' },
    { id: 'just_be', label: 'I’m just here' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Header Section */}
      <div className="space-y-4 mb-10 text-center">
        <Heading level={2} className="font-light tracking-tight text-2xl md:text-3xl text-primary/90">
          What brings you here right now?
        </Heading>
        <Text className="text-base text-muted-foreground/80">
          You can skip this. You can also change it later.
        </Text>
      </div>

      {/* 2. Options Grid */}
      <div className="w-full space-y-3 mb-12">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedIntent(option.id)}
            className={`
              w-full p-4 rounded-xl text-left border transition-all duration-200
              ${selectedIntent === option.id 
                ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' 
                : 'border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30'}
            `}
          >
            <span className={`text-lg font-normal ${selectedIntent === option.id ? 'text-primary' : 'text-foreground/80'}`}>
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Actions */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button 
          onClick={handleContinue}
          size="lg"
          variant={selectedIntent ? 'default' : 'secondary'} // Subtle visual cue
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
