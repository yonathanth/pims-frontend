import { useEffect, useState, useCallback } from 'react';
import type { EmployeeItem } from '../data/employeeData';
import { listUsers } from '../api/users';

export function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listUsers();
      const mapped = result.map((u: any) => ({
        id: String(u.id ?? u.userId),
        name: u.fullName ?? u.full_name,
        username: u.username,
        role: u.role,
        email: u.email,
      }));
      setEmployees(mapped);
      setError(null);
    } catch (error: any) {
      const message =
        (error?.details && (error.details.message || error.details.error)) ||
        error?.message ||
        'Failed to fetch employees';
      setError(message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, loading, error, refetch: fetchEmployees };
}
