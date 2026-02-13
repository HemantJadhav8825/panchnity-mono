'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { GuestGuard } from '@/components/auth/GuestGuard';

function LoginContent() {
  const { login, googleLogin, isLoading, error, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleLoginCalled = useRef(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already logged in - Handled by GuestGuard now
  // useEffect(() => {
  //   if (isAuthenticated && !isLoading) {
  //     router.push('/dashboard');
  //   }
  // }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code && !googleLoginCalled.current) {
      googleLoginCalled.current = true;
      const redirectUri = `${window.location.origin}/login`;
      googleLogin(code, redirectUri)
        .then(() => {
          // Success handled by router push
        })
        .catch(() => {
          // Error handled by context
        });

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('code');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, googleLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (err) {
      // Error handled by context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="You've been missed. Sign in to continue."
    >
      <LoginForm
        formData={formData}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/20 uppercase tracking-widest font-bold text-xs">Loading Panchnity...</div>}>
      <GuestGuard>
        <LoginContent />
      </GuestGuard>
    </Suspense>
  );
}
