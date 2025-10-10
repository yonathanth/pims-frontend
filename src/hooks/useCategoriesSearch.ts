import { useCallback, useEffect, useState } from 'react';
import { listCategories } from '../api/products';

export interface CategoryOption {
  id: string;
  name: string;
  description?: string;
}

export function useCategoriesSearch() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCategories = useCallback(async (searchTerm: string = '') => {
    setLoading(true);
    try {
      // Use a high limit to get most categories, and search by the term
      const res = await listCategories({
        q: searchTerm,
        limit: 100, // High limit to get all matching categories
        // page: 1,
        sort_by: 'name',
        // sort_dir: 'asc',
      });

      const options: CategoryOption[] = res.data.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
      }));

      setCategories(options);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to search categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load with empty search to get first batch
  useEffect(() => {
    searchCategories('');
  }, [searchCategories]);

  return {
    categories,
    loading,
    error,
    searchCategories,
  };
}
