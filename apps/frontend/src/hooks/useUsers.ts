import { useUsersContext } from '../context/UsersContext';

export const useUsers = (limit: number = 20, offset: number = 0) => {
  const { users, isLoading, error } = useUsersContext();
  
  // Slice the cached users based on limit and offset
  // Note: If we need pagination beyond the initial 50, we would need to enhance the context
  // But for now, this prevents the repeated initial calls.
  const slicedUsers = users.slice(offset, offset + limit);

  return {
    users: slicedUsers,
    isLoading,
    error,
    isEmpty: !isLoading && slicedUsers.length === 0,
  };
};
