'use client';

import React from 'react';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';
import { GoogleButton } from '@/components/auth/GoogleButton';
import Link from 'next/link';

interface LoginFormProps {
  formData: any;
  isLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  isLoading,
  error,
  onSubmit,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <GoogleButton />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-extrabold">
          <span className="bg-background px-4 text-foreground/40 dark:text-muted-foreground/30">Or use email</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 text-xs animate-shake font-bold">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 dark:text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              name="email"
              required
              inputMode="email"
              autoComplete="email"
              value={formData.email}
              onChange={onChange}
              className="w-full bg-muted/50 dark:bg-muted/40 border border-border rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-primary/50 focus:bg-muted/80 dark:focus:bg-muted/60 transition-all placeholder:text-foreground/30 dark:placeholder:text-muted-foreground/20 text-sm font-semibold text-foreground shadow-sm"
              placeholder="Email address"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 dark:text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={onChange}
              className="w-full bg-muted/50 dark:bg-muted/40 border border-border rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:border-primary/50 focus:bg-muted/80 dark:focus:bg-muted/60 transition-all placeholder:text-foreground/30 dark:placeholder:text-muted-foreground/20 text-sm font-semibold text-foreground shadow-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div className="flex justify-end pr-1">
          <button type="button" className="text-[11px] text-foreground/60 dark:text-muted-foreground/50 hover:text-primary transition-colors font-extrabold uppercase tracking-widest">
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-primary hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm uppercase tracking-wider"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Log In
            </>
          )}
        </button>
      </form>

      <div className="pt-4 text-center">
        <p className="text-sm text-foreground/60 dark:text-muted-foreground font-bold">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:brightness-110 font-extrabold transition-all border-b border-primary/20 hover:border-primary">
            Join Panchnity
          </Link>
        </p>
      </div>


    </div>
  );
};
