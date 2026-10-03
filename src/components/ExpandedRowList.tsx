import { useEffect, useState, type ReactNode } from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { ChevronLeft, ChevronRight } from '@carbon/icons-react';

export interface ExpandedRowColumn<T> {
  header: string;
  render: (item: T) => ReactNode;
}

interface ExpandedRowListProps<T> {
  title: string;
  // Fetches one page; called when the row is expanded and on page changes,
  // so collapsed rows fetch nothing
  load: (
    page: number,
    pageSize: number,
  ) => Promise<{ items: T[]; total: number }>;
  pageSize?: number;
  columns: ExpandedRowColumn<T>[];
  getKey: (item: T) => string | number;
  emptyText: string;
  getRowClassName?: (item: T) => string | undefined;
}

export function ExpandedRowList<T>({
  title,
  load,
  columns,
  getKey,
  emptyText,
  getRowClassName,
  pageSize = 10,
}: ExpandedRowListProps<T>) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    load(page, pageSize)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((e: any) => {
        if (!cancelled) setError(e?.message || 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // load is recreated on each render; refetch only when the page changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  return (
    <div className="p-6">
      <h4 className="font-semibold text-lg mb-3">
        {title}
        {items && (
          <span
            className="ml-2 text-sm font-normal"
            style={{ color: 'var(--cds-text-secondary)' }}
          >
            {total}
          </span>
        )}
      </h4>

      {error ? (
        <p style={{ color: 'var(--cds-text-error)' }}>{error}</p>
      ) : !items && loading ? (
        <InlineLoading description="Loading..." />
      ) : !items || items.length === 0 ? (
        <p style={{ color: 'var(--cds-text-secondary)' }}>{emptyText}</p>
      ) : (
        <div style={{ opacity: loading ? 0.5 : 1 }}>
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left"
                style={{ borderBottom: '1px solid var(--cds-border-subtle)' }}
              >
                {columns.map((c) => (
                  <th key={c.header} className="py-2 pr-4 font-medium">
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={getKey(item)}
                  className={getRowClassName?.(item)}
                  style={{ borderBottom: '1px solid var(--cds-border-subtle)' }}
                >
                  {columns.map((c) => (
                    <td key={c.header} className="py-2 pr-4">
                      {c.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 pt-3 text-sm">
              <span style={{ color: 'var(--cds-text-secondary)' }}>
                {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}{' '}
                of {total}
              </span>
              <Button
                kind="ghost"
                size="sm"
                hasIconOnly
                renderIcon={ChevronLeft}
                iconDescription="Previous page"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              />
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                kind="ghost"
                size="sm"
                hasIconOnly
                renderIcon={ChevronRight}
                iconDescription="Next page"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExpandedRowList;
