'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';
import { GuestGuard } from '@/components/auth/GuestGuard';

export default function SignupPage() {
  const { signup, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await signup({ email: formData.email, password: formData.password });
    } catch (err) {
      // Error handled by context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <GuestGuard>
      <AuthLayout 
        title="Create Account" 
        subtitle="Join WeBelong and find your community."
      >
        <SignupForm 
          formData={formData}
          isLoading={isLoading}
          error={error || localError}
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
      </AuthLayout>
    </GuestGuard>
  );
}
