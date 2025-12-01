import { useEffect, useState, useCallback, useMemo } from 'react';
import type { EmployeeItem } from '../data/employeeData';
import { listUsers } from '../api/users';

export function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    'id' | 'name' | 'username' | 'role' | 'email' | 'phoneNumber'
  >('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listUsers();
      const mapped = result.map((u: any) => ({
        id: String(u.id ?? u.userId),
        name: u.fullName ?? u.full_name ?? '',
        username: u.username ?? '',
        role: u.role ?? '',
        email: u.email ?? '',
        phoneNumber: u.phoneNumber ?? '',
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

  // Sort employees based on current sort settings
  const sortedEmployees = useMemo(() => {
    if (!employees.length) return [];

    return [...employees].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'id':
          aValue = parseInt(a.id);
          bValue = parseInt(b.id);
          break;
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'username':
          aValue = (a.username || '').toLowerCase();
          bValue = (b.username || '').toLowerCase();
          break;
        case 'role':
          aValue = (a.role || '').toLowerCase();
          bValue = (b.role || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'phoneNumber':
          aValue = (a.phoneNumber || '').toLowerCase();
          bValue = (b.phoneNumber || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [employees, sortBy, sortDir]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees: sortedEmployees,
    loading,
    error,
    refetch: fetchEmployees,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
  };
}
