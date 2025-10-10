import { useCallback, useEffect, useState } from 'react';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/products';

export interface CategoryRow {
  id: string;
  name: string;
  description: string; // truncated
  fullDescription: string; // full
  productsCount: number;
}

const truncate = (text: string, max = 120) =>
  text.length > max ? text.slice(0, max).trimEnd() + '…' : text;

export function useCategories() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'id'>('id');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');
  const [totalItems, setTotalItems] = useState(0);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCategories({
        q,
        limit,
        // backend expects page/sortBy/sortDir
        ...(page ? { page } : ({} as any)),
        ...(sortBy ? { sortBy } : ({} as any)),
        ...(sortDir ? { sortDir: sortDir.toLowerCase() } : ({} as any)),
      } as any);
      const rows = res.data;
      const meta = res.meta || { totalItems: rows.length, page, limit };
      const mapped: CategoryRow[] = rows.map((c: any) => ({
        id: String(c.id),
        name: c.name,
        fullDescription: c.description ?? '',
        description: truncate(c.description ?? ''),
        productsCount: c.drugCount ?? 0,
      }));
      setCategories(mapped);
      setTotalItems(meta.totalItems ?? mapped.length);
      setError(null);
    } catch (e) {
      setError('Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [q, limit, page, sortBy, sortDir]);

  useEffect(() => {
    // ensure first fetch uses current page/limit (table default page size)
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (input: any) => {
    try {
      const created = await createCategory(input);
      setCategories((prev) => [
        {
          id: String((created as any).id ?? (created as any).categoryId),
          name: (created as any).name,
          fullDescription: (created as any).description ?? '',
          description: truncate((created as any).description ?? ''),
          productsCount: 0,
        },
        ...prev,
      ]);
      setError(null);
      return { ok: true } as const;
    } catch (e: any) {
      const message = e?.message || 'Failed to create category';
      setError(message);
      return { ok: false, message } as const;
    }
  };

  const editCategory = async (id: string, input: any) => {
    try {
      const updated = await updateCategory(Number(id), input);
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                name: (updated as any).name,
                fullDescription: (updated as any).description ?? '',
                description: truncate((updated as any).description ?? ''),
              }
            : c,
        ),
      );
      setError(null);
      return { ok: true } as const;
    } catch (e: any) {
      const message = e?.message || 'Failed to update category';
      setError(message);
      return { ok: false, message } as const;
    }
  };

  const removeCategory = async (id: string) => {
    try {
      await deleteCategory(Number(id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setError(null);
      return { ok: true } as const;
    } catch (e: any) {
      const message = e?.message || 'Failed to delete category';
      setError(message);
      return { ok: false, message } as const;
    }
  };

  const clearError = () => setError(null);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    // server-driven controls
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
    addCategory,
    editCategory,
    removeCategory,
    clearError,
  };
}
