import { useState, useEffect } from 'react';
import { listUsers } from '../api/users';

export interface UserOption {
  id: number;
  text: string;
  value: number;
}

export function useUsers() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await listUsers({ limit: 1000 }); // Get all users
        const userData = (response as any).data || [];

        const userOptions: UserOption[] = userData.map((user: any) => ({
          id: user.id,
          text: `${user.username} (${user.role})`,
          value: user.id,
        }));

        setUsers(userOptions);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch users');
        setUsers([]);
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}






