import { useCallback, useEffect, useState } from 'react';
import {
  listUnitTypes,
  createUnitType,
  updateUnitType,
  deleteUnitType,
  type UnitType,
  type CreateUnitTypeInput,
  type UpdateUnitTypeInput,
} from '../api/unit-types';

export interface UnitTypeRow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  batchCount: number;
}

export function useUnitTypes() {
  const [unitTypes, setUnitTypes] = useState<UnitTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'batchCount' | 'id' | 'createdAt'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [totalItems, setTotalItems] = useState(0);

  const fetchUnitTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUnitTypes({
        page,
        limit,
        search: q || undefined,
        sortBy,
        sortDir,
      });
      const rows = res.data || [];
      const mapped: UnitTypeRow[] = rows.map((ut: UnitType) => ({
        id: String(ut.id),
        name: ut.name,
        description: ut.description || '',
        isActive: ut.isActive,
        batchCount: ut.batchCount || 0,
      }));
      setUnitTypes(mapped);
      setTotalItems(res.meta?.totalItems || mapped.length);
      setError(null);
    } catch (e: any) {
      setError('Failed to fetch unit types');
      setUnitTypes([]);
    } finally {
      setLoading(false);
    }
  }, [q, limit, page, sortBy, sortDir]);

  useEffect(() => {
    fetchUnitTypes();
  }, [fetchUnitTypes]);

  const addUnitType = async (input: CreateUnitTypeInput) => {
    try {
      await createUnitType(input);
      await fetchUnitTypes();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, message: e?.message || 'Failed to add unit type' };
    }
  };

  const editUnitType = async (id: number, input: UpdateUnitTypeInput) => {
    try {
      await updateUnitType(id, input);
      await fetchUnitTypes();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, message: e?.message || 'Failed to update unit type' };
    }
  };

  const removeUnitType = async (id: number) => {
    try {
      await deleteUnitType(id);
      await fetchUnitTypes();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, message: e?.message || 'Failed to delete unit type' };
    }
  };

  const clearError = () => setError(null);

  return {
    unitTypes,
    loading,
    error,
    addUnitType,
    editUnitType,
    removeUnitType,
    page,
    setPage,
    limit,
    setLimit,
    q,
    setQ,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    totalItems,
    clearError,
    refetch: fetchUnitTypes,
  };
}

