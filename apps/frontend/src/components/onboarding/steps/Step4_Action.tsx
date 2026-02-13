'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';

interface Step4ActionProps {
  onNext: () => void;
}

export const Step4_Action: React.FC<Step4ActionProps> = ({ onNext }) => {
  // We chose the "Read quietly" option as it's the most passive, safe, 
  // and "foyer"-like action that transitions naturally to the feed.
  // It requires no additional UI state or complex logic, adhering strictly
  // to the "least additional plumbing" requirement.

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Content Section */}
      <div className="space-y-4 mb-12 text-center">
        <Heading level={2} className="font-light tracking-tight text-2xl md:text-3xl text-primary/90">
          There’s no right way to begin.
        </Heading>
        <Text className="text-base text-muted-foreground/80">
          Choose what feels easiest right now.
        </Text>
      </div>

      {/* 2. Action Card (Primary Option) */}
      <div className="w-full mb-8">
        <button
          onClick={onNext}
          className="
            w-full p-8 rounded-2xl border bg-card hover:bg-accent/30 
            hover:border-primary/30 transition-all duration-300 group
            flex flex-col items-center text-center gap-3
            shadow-sm hover:shadow-md
          "
        >
          <div className="p-3 rounded-full bg-primary/5 text-primary mb-1 group-hover:scale-110 transition-transform duration-300">
            {/* Simple Book / Reading Icon SVG */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-medium text-foreground/90 group-hover:text-primary transition-colors">
            Read quietly
          </h3>
          
          <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors max-w-[200px]">
             Browse the Sanctuary without pressure to post.
          </p>
        </button>
      </div>

      {/* 3. Secondary Actions */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* We don't need a primary button here since the card IS the primary action, 
            but a subtle confirmation button can be helpful if they miss the card click interaction 
            or prefer standard UI patterns. */}
        
        <button 
          onClick={onNext}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 outline-none focus:ring-2 focus:ring-primary/20 rounded-md"
        >
          Skip
        </button>
      </div>

    </div>
  );
};
