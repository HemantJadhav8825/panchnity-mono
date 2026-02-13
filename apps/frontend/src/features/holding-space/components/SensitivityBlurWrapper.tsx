'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface SensitivityBlurWrapperProps {
  children: React.ReactNode;
  tags: string[];
}

export const SensitivityBlurWrapper: React.FC<SensitivityBlurWrapperProps> = ({ children, tags }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!tags || tags.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className={`transition-all duration-300 ${isRevealed ? 'filter-none' : 'blur-sm select-none pointer-events-none'}`}>
        {children}
      </div>

      {!isRevealed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/50 backdrop-blur-[2px] rounded-lg">
          <p className="text-sm text-muted-foreground mb-2 font-medium">
            This post mentions: <span className="text-foreground">{tags.join(', ')}</span>
          </p>
          <button
            onClick={() => setIsRevealed(true)}
            className="flex items-center gap-2 px-4 py-2 bg-background border rounded-full shadow-sm hover:bg-secondary transition-colors text-sm font-medium"
          >
            <Eye size={16} />
            Reveal
          </button>
        </div>
      )}
      
      {isRevealed && (
          <button
            onClick={() => setIsRevealed(false)}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground bg-background/80 rounded-full"
            title="Hide content"
          >
            <EyeOff size={16} />
          </button>
      )}
    </div>
  );
};
