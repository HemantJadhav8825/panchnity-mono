import React from 'react';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative overflow-hidden">
      {/* 
        Onboarding Shell
        - Full viewport
        - Neutral background (inherited from bg-background)
        - No navigation
        - No footer
      */}
      <main className="flex-1 flex flex-col h-full w-full">
        {children}
      </main>
    </div>
  );
}
