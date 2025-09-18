import { useState, useMemo, useEffect, type ReactNode } from 'react';
import {
  Button,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TextInput,
  Checkbox,
} from '@carbon/react';
import { Search, ChevronDown, ChevronRight, Close } from '@carbon/icons-react';

// Generic types for the sortable table
export interface TableHeader {
  key: string;
  header: string;
}

export interface TableRow {
  id: string;
  [key: string]: any;
}

type FilterOption = string | { text: string; value: string };

export interface SortableTableProps<T extends TableRow = TableRow> {
  title: string;
  headers: TableHeader[];
  data: T[];
  filterOptions: FilterOption[];
  customFilters?: (row: T, activeFilter: string) => boolean;
  searchField?: string;
  searchPlaceholder?: string;
  expandedRowContent?: (row: T) => ReactNode;
  actions?: ReactNode;
  exportActions?: ReactNode;
  searchActions?: ReactNode;
  className?: string;
  renderCell?: (row: T, key: string) => React.ReactNode;
  controlled?: {
    page?: number;
    pageSize?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    sortColumn?: string;
    sortDirection?: 'ASC' | 'DESC';
    onSort?: (column: string, dir: 'ASC' | 'DESC') => void;
    search?: string;
    onSearchChange?: (value: string) => void;
    activeFilter?: string;
    onFilterChange?: (value: string) => void;
    sortableKeys?: string[];
  };
  enableSearch?: boolean;
  customFilterSection?: ReactNode;
}

export const SortableTable = <T extends TableRow = TableRow>({
  title,
  headers,
  data,
  filterOptions,
  customFilters,
  searchField = 'name',
  searchPlaceholder,
  expandedRowContent,
  actions,
  exportActions,
  searchActions,
  className = '',
  renderCell = undefined,
  controlled,
  enableSearch = true,
  customFilterSection,
}: SortableTableProps<T>) => {
  // State
  const [search, setSearch] = useState(controlled?.search ?? '');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState(
    controlled?.activeFilter ??
      (filterOptions[0]
        ? typeof filterOptions[0] === 'object'
          ? filterOptions[0].value
          : filterOptions[0]
        : 'All'),
  );
  const [page, setPage] = useState(controlled?.page ?? 1);
  const [pageSize, setPageSize] = useState(controlled?.pageSize ?? 10);

  // Sorting state
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>(
    controlled?.sortDirection ?? 'ASC',
  );
  const [sortColumn, setSortColumn] = useState<string>(
    controlled?.sortColumn ?? (headers[0]?.key || ''),
  );

  // Default filter function
  const defaultFilter = (_row: T, activeFilter: string): boolean => {
    if (activeFilter === 'All') return true;
    // Add more default filter logic as needed
    return true;
  };

  // Emit initial controlled values on first render so the backend uses the table's initial state
  useEffect(() => {
    if (!controlled) return;
    controlled.onPageChange?.(page);
    controlled.onPageSizeChange?.(pageSize);
    if (controlled.sortColumn) {
      controlled.onSort?.(controlled.sortColumn, sortDirection);
    }
    if (typeof controlled.search !== 'undefined') {
      controlled.onSearchChange?.(search);
    }
    if (typeof controlled.activeFilter !== 'undefined') {
      controlled.onFilterChange?.(activeFilter);
    }
    // one-time on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isHeaderSortable = (key: string) => {
    if (key === 'actions') return false;
    if (controlled?.sortableKeys) return controlled.sortableKeys.includes(key);
    return true;
  };

  // Filter/search/sort logic
  const filteredAndSortedRows = useMemo(() => {
    // In controlled mode, server handles filtering/sorting/paging
    if (controlled) return data;
    // First filter the rows
    const filtered = data.filter((row) => {
      // Apply custom filters or default filter
      const filterResult = customFilters
        ? customFilters(row, activeFilter)
        : defaultFilter(row, activeFilter);
      if (!filterResult) return false;

      // Apply search filter
      if (search && searchField) {
        const searchValue = row[searchField];
        if (searchValue && typeof searchValue === 'string') {
          return searchValue.toLowerCase().includes(search.toLowerCase());
        }
      }
      return true;
    });

    // Then sort the filtered rows
    return [...filtered].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'ASC' ? aValue - bValue : bValue - aValue;
      }

      // Handle date strings (check if column name suggests it's a date)
      if (
        sortColumn.toLowerCase().includes('date') ||
        sortColumn.toLowerCase().includes('time')
      ) {
        const aDate = new Date(String(aValue));
        const bDate = new Date(String(bValue));
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortDirection === 'ASC'
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }
      }

      // Default string comparison
      const aString = String(aValue || '').toLowerCase();
      const bString = String(bValue || '').toLowerCase();
      return sortDirection === 'ASC'
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });
  }, [
    data,
    search,
    activeFilter,
    sortColumn,
    sortDirection,
    customFilters,
    searchField,
  ]);

  const totalItemsControlled =
    controlled?.totalItems ?? filteredAndSortedRows.length;
  const totalPages = Math.ceil(totalItemsControlled / pageSize);
  if (page > totalPages && totalPages > 0) setPage(1);
  const pagedRows = controlled
    ? data
    : filteredAndSortedRows.slice((page - 1) * pageSize, page * pageSize);

  // Sorting handler
  const handleSort = (key: string) => {
    if (sortColumn === key) {
      const next = sortDirection === 'ASC' ? 'DESC' : 'ASC';
      controlled?.onSort?.(key, next);
      setSortDirection(next);
    } else {
      controlled?.onSort?.(key, 'ASC');
      setSortColumn(key);
      setSortDirection('ASC');
    }
  };

  // Pagination component
  const Pagination = () => (
    <div
      className="px-6 py-4 flex justify-between items-center"
      style={{ color: 'var(--cds-text-secondary)' }}
    >
      <div className="flex items-center">
        <span className="mr-2 text-sm">Items per page:</span>
        <select
          className="px-2 py-1 rounded"
          style={{
            background: 'var(--cds-layer)',
            color: 'var(--cds-text-primary)',
            border: '1px solid var(--cds-border-subtle)',
          }}
          value={pageSize}
          onChange={(e) => {
            const size = Number(e.target.value);
            setPageSize(size);
            setPage(1);
            controlled?.onPageSizeChange?.(size);
            controlled?.onPageChange?.(1);
          }}
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="ml-4 text-sm">
          {totalItemsControlled === 0
            ? '0'
            : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalItemsControlled)}`}
          {` of ${totalItemsControlled} items`}
        </span>
      </div>
      <div className="flex items-center">
        <span className="mr-2 text-sm">
          {page} of {totalPages} pages
        </span>
        <div className="flex">
          <button
            type="button"
            className="p-2 rounded-l disabled:opacity-50"
            style={{
              background: 'var(--cds-layer)',
              color: 'var(--cds-text-primary)',
              border: '1px solid var(--cds-border-subtle)',
            }}
            onClick={() => {
              setPage(page - 1);
              controlled?.onPageChange?.(page - 1);
            }}
            disabled={page === 1}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 24L10 16L20 8L20 24Z" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            className="p-2 rounded-r disabled:opacity-50"
            style={{
              background: 'var(--cds-layer)',
              color: 'var(--cds-text-primary)',
              border: '1px solid var(--cds-border-subtle)',
              borderLeft: 'none',
            }}
            onClick={() => {
              setPage(page + 1);
              controlled?.onPageChange?.(page + 1);
            }}
            disabled={page === totalPages}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 8L22 16L12 24L12 8Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={` w-full ${className}`}
      style={{ backgroundColor: 'var(--cds-background)' }}
    >
      {/* Export Actions (top right, separate) */}
      {exportActions && (
        <div className="flex justify-end px-6 pt-6">{exportActions}</div>
      )}

      {/* Legacy Actions (for backward compatibility) */}
      {actions && !exportActions && !searchActions && (
        <div className="flex justify-end px-6 pt-6">{actions}</div>
      )}

      {/* Filters, Search */}
      <div className="flex flex-wrap items-center gap-2 px-6 pt-6">
        {filterOptions.length > 0 && (
          <div
            className="flex gap-1 flex-1 overflow-x-auto scrollbar-thin"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex gap-1 flex-nowrap">
              {filterOptions.map((option) => {
                const filterValue =
                  typeof option === 'object'
                    ? (option as { text: string; value: string }).value
                    : option;
                const displayText =
                  typeof option === 'object'
                    ? (option as { text: string; value: string }).text
                    : option;
                return (
                  <Button
                    key={filterValue}
                    kind={activeFilter === filterValue ? 'primary' : 'ghost'}
                    size="sm"
                    className="font-medium rounded-full px-3 py-1 whitespace-nowrap"
                    onClick={() => {
                      setActiveFilter(filterValue);
                      setPage(1);
                      controlled?.onFilterChange?.(filterValue);
                    }}
                  >
                    {displayText}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex gap-2 items-center ml-auto">
          {enableSearch &&
          (showSearch ||
            search.length > 0 ||
            (controlled?.search ?? '').length > 0) ? (
            <div className="relative flex items-center w-[250px]">
              <TextInput
                id="search"
                labelText=""
                placeholder={searchPlaceholder || 'Search'}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                  controlled?.onPageChange?.(1);
                  controlled?.onSearchChange?.(e.target.value);
                }}
                size="md"
                className="w-full pr-8"
                autoFocus={
                  showSearch &&
                  !(controlled && typeof controlled.search !== 'undefined')
                }
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent border-none p-0"
                style={{ color: 'var(--cds-text-secondary)' }}
                onClick={() => {
                  setShowSearch(false);
                  setSearch('');
                  controlled?.onPageChange?.(1);
                  controlled?.onSearchChange?.('');
                }}
                tabIndex={-1}
              >
                <Close size={20} />
              </button>
            </div>
          ) : enableSearch ? (
            <Button
              kind="ghost"
              hasIconOnly
              renderIcon={Search}
              iconDescription="Search"
              onClick={() => setShowSearch(true)}
              size="sm"
            />
          ) : null}
          {searchActions && searchActions}
        </div>
      </div>

      {/* Custom Filter Section */}
      {customFilterSection && (
        <div className="px-6 pb-4">{customFilterSection}</div>
      )}

      {/* Table */}
      <div className="p-6">
        <TableContainer title={title}>
          <DataTable rows={pagedRows} headers={headers} isSortable>
            {({
              rows,
              headers: tableHeaders,
              getHeaderProps,
              getRowProps,
              getTableProps,
            }) => (
              <Table {...getTableProps()} useZebraStyles>
                <TableHead>
                  <TableRow>
                    {expandedRowContent && (
                      <TableHeader className="w-10"></TableHeader>
                    )}
                    <TableHeader className="w-10"></TableHeader>
                    {tableHeaders.map((header) => (
                      <TableHeader
                        {...getHeaderProps({
                          header,
                          isSortable: isHeaderSortable(header.key),
                          onClick: () => {
                            if (!isHeaderSortable(header.key)) return;
                            handleSort(header.key);
                          },
                        })}
                        key={header.key}
                        className="cursor-pointer"
                        style={{ backgroundColor: 'var(--cds-layer)' }}
                      >
                        <div className="flex items-center">
                          <span>{header.header}</span>
                        </div>
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const isExpanded = expandedRow === row.id;
                    const rowData = pagedRows.find((r) => r.id === row.id);
                    const totalColumns =
                      tableHeaders.length + (expandedRowContent ? 1 : 0) + 1; // expand toggle + checkbox
                    return (
                      <>
                        <TableRow {...getRowProps({ row })} key={row.id}>
                          {expandedRowContent && (
                            <TableCell className="w-10">
                              <button
                                type="button"
                                className="p-2"
                                onClick={() =>
                                  setExpandedRow(isExpanded ? null : row.id)
                                }
                                aria-label={
                                  isExpanded ? 'Collapse row' : 'Expand row'
                                }
                              >
                                {isExpanded ? (
                                  <ChevronDown size={16} />
                                ) : (
                                  <ChevronRight size={16} />
                                )}
                              </button>
                            </TableCell>
                          )}
                          <TableCell className="w-10">
                            <Checkbox
                              id={`checkbox-${row.id}`}
                              labelText=""
                              hideLabel
                            />
                          </TableCell>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {renderCell && rowData
                                ? renderCell(rowData, cell.info.header)
                                : cell.value}
                            </TableCell>
                          ))}
                        </TableRow>
                        {isExpanded && rowData && expandedRowContent && (
                          <TableRow key={`${row.id}-expanded`}>
                            <TableCell colSpan={totalColumns} className="p-0">
                              {expandedRowContent(rowData)}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </DataTable>
        </TableContainer>
      </div>

      {/* Pagination */}
      <Pagination />
    </div>
  );
};

export default SortableTable;
