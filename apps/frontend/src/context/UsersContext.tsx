"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userService } from '../api/user.service';
import { User } from '../api/auth.service';
import { useAuth } from './AuthContext';

interface UsersContextType {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (authLoading || !isAuthenticated) {
        if (!authLoading && !isAuthenticated) {
            setIsLoading(false);
            setUsers([]);
        }
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Fetch a focused set of users typically needed for the UI
      // 50 covers most initial viewports (stories + feed + chat list)
      const data = await userService.listUsers(50, 0);
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <UsersContext.Provider value={{ users, isLoading, error, refreshUsers: fetchUsers }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsersContext = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsersContext must be used within a UsersProvider');
  }
  return context;
};
