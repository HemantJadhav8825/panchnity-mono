'use client';

import React from 'react';
import { brand } from '@/config/brand';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

import { Illustration } from '@/illustrations';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground font-body overflow-x-hidden transition-colors duration-300">
      {/* Theme Toggle Positioned */}
      <div className="fixed top-6 right-6 z-[60]">
        <ThemeToggle />
      </div>

      {/* LEFT PANEL: Brand Visuals (Desktop only) */}
      <div className="hidden lg:flex lg:w-[60%] relative flex-col items-center justify-center p-12 overflow-hidden border-r border-border bg-muted/30 dark:bg-background transition-colors duration-300">
        {/* Animated Background Gradients (Theme aware) */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10 max-w-lg text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold font-heading tracking-tight leading-[1.15] bg-gradient-to-br from-foreground via-foreground to-foreground/50 dark:from-white dark:via-white dark:to-white/30 bg-clip-text text-transparent italic pb-2">
              {brand.TAGLINE}
            </h1>
            <p className="text-xl text-foreground/60 dark:text-white/50 font-medium leading-relaxed">
              Discover a space where your presence is valued and your voice truly matters.
            </p>
          </div>

          {/* Visual Stack (Semantic Illustration) */}
          <div className="relative w-full flex items-center justify-center mt-6">
            <Illustration 
              type="auth-welcome" 
              size={400} 
              className="drop-shadow-2xl" 
            />
          </div>
        </div>
      </div>


      {/* RIGHT PANEL: Auth Form */}
      <div className="flex-1 lg:w-[40%] flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobile-only background blur elements (Theme aware) */}
        <div className="lg:hidden absolute top-[-5%] right-[-5%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[80px]" />
        
        <div className="w-full max-w-[400px] flex flex-col space-y-8 z-10 transition-all duration-500 ease-in-out">
          {/* Logo & Heading */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <h2 className="text-3xl font-bold font-heading tracking-tighter text-foreground">
                {brand.PRODUCT_NAME}
              </h2>
            </Link>
            {title && (
              <h3 className="text-xl font-semibold text-foreground/90 tracking-tight transition-all duration-300">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-foreground/40 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {/* Render Auth Form */}
          <div className="bg-card lg:bg-transparent border border-border lg:border-none p-6 md:p-8 rounded-[2rem] lg:p-0 shadow-lg lg:shadow-none backdrop-blur-xl lg:backdrop-blur-none transition-all">
            {children}
          </div>

          {/* Footer Copy */}
          <p className="text-center text-[11px] text-foreground/20 uppercase tracking-[0.2em] font-bold">
            &copy; {new Date().getFullYear()} {brand.PRODUCT_NAME} from {brand.PARENT.NAME}
          </p>
        </div>
      </div>
    </div>
  );
};

