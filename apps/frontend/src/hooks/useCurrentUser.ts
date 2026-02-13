import { useAuth } from '../context/AuthContext';

export const useCurrentUser = () => {
  const { user, isLoading, error, refreshUser } = useAuth();

  return {
    user,
    isLoading,
    error,
    refreshUser
  };
};
