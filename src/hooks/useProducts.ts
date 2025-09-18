import { useEffect, useState, useCallback } from 'react';
import type { ProductItem } from '../data/productData';
import { listDrugs } from '../api/products';

export function useProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<'sku' | 'genericName' | 'brandName'>(
    'genericName',
  );
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('ASC');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [totalItems, setTotalItems] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listDrugs({
        q,
        limit,
        ...(page ? { page } : ({} as any)),
        ...(categoryId ? { category_id: categoryId } : ({} as any)),
        ...(sortBy ? { sort_by: sortBy as any } : ({} as any)),
        ...(sortDir ? { descending: sortDir === 'DESC' } : ({} as any)),
      } as any);
      const rows = (res as any).data || [];
      const meta = (res as any).meta || {
        totalItems: rows.length,
        page,
        limit,
      };
      const mapped = rows.map((drug: any) => ({
        // Map backend fields to ProductItem interface
        id: String(drug.id ?? drug.drugId ?? drug.drug_id),
        name: drug.genericName ?? drug.generic_name,
        sku: drug.sku,
        brand: drug.brandName ?? drug.brand_name ?? 'N/A',
        category: drug.categoryName ?? 'Unknown',
        categoryId: drug.categoryId ?? drug.category_id,
        strength: drug.strength,
        description: drug.description,
      }));
      setProducts(mapped);
      setTotalItems(meta.totalItems ?? mapped.length);
      setError(null);
    } catch (error) {
      setError('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [q, limit, page, sortBy, sortDir, categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
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
    categoryId,
    setCategoryId,
    totalItems,
  };
}
