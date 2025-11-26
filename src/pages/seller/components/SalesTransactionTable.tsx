import React, { useState } from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TextInput,
  Select,
  SelectItem,
  Button,
  Pagination,
  Tag,
  InlineNotification,
} from '@carbon/react';
import { Renew } from '@carbon/icons-react';
import { useSales } from '../../../hooks/useSales';
import { type Sale } from '../../../api/sales';

export const SalesTransactionTable: React.FC = () => {
  const {
    salesData,
    loading,
    error,
    params,
    refreshSales,
    setSearch,
    setStatus,
    goToPage,
  } = useSales();

  const [searchValue, setSearchValue] = useState(params.search || '');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      setSearch(value);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(amount);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'approved':
        return <Tag type="green">Approved</Tag>;
      case 'declined':
        return <Tag type="red">Declined</Tag>;
      case 'pending':
        return <Tag type="warm-gray">Pending</Tag>;
      default:
        return <Tag type="gray">{status}</Tag>;
    }
  };

  const headers = [
    { key: 'date', header: 'Date' },
    { key: 'drugName', header: 'Drug Name' },
    { key: 'sku', header: 'SKU' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'customer', header: 'Customer' },
    { key: 'totalPrice', header: 'Total Price' },
    { key: 'status', header: 'Status' },
    { key: 'batch', header: 'Batch' },
  ];

  const rows =
    salesData?.sales.map((sale: Sale) => ({
      id: sale.id,
      date: formatDate(sale.createdAt),
      drugName: sale.drugName,
      sku: sale.sku,
      quantity: sale.quantity,
      customer: sale.customerName,
      totalPrice: formatCurrency(sale.totalPrice),
      status: getStatusTag(sale.status),
      batch: sale.batchNumber,
    })) || [];

  if (error) {
    return (
      <div className="mb-4">
        <InlineNotification
          kind="error"
          title="Error Loading Sales"
          subtitle={error}
          onClose={() => {
            refreshSales();
            return true;
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 flex-shrink-0">
        <div className="flex-1">
          <TextInput
            id="search"
            labelText="Search sales"
            placeholder="Search by drug name or customer..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            id="status-filter"
            labelText="Status"
            value={params.status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <SelectItem value="all" text="All Status" />
            <SelectItem value="pending" text="Pending" />
            <SelectItem value="approved" text="Approved" />
            <SelectItem value="declined" text="Declined" />
          </Select>
        </div>
        <Button
          kind="secondary"
          renderIcon={Renew}
          onClick={refreshSales}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Results Summary */}
      {salesData && (
        <div
          className="mb-3 text-sm flex-shrink-0"
          style={{ color: 'var(--cds-text-secondary)' }}
        >
          Showing {salesData.sales.length} of {salesData.pagination.total} sales
          {params.search && ` matching "${params.search}"`}
        </div>
      )}

      {/* Table Container with Scroll */}
      <div className="flex-1 overflow-auto">
        <DataTable
          rows={rows.map((row) => ({ ...row, id: String(row.id) }))}
          headers={headers}
          isSortable
          useZebraStyles
        >
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={headers.length}
                        className="text-center py-8"
                      >
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                          Loading sales...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={headers.length}
                        className="text-center py-8 text-gray-500"
                      >
                        No sales found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>

      {/* Pagination */}
      {salesData && salesData.pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center flex-shrink-0">
          <Pagination
            page={salesData.pagination.page}
            pageSize={salesData.pagination.limit}
            totalItems={salesData.pagination.total}
            pageSizes={[10, 20, 50]}
            onChange={({ page }) => {
              goToPage(page);
            }}
          />
        </div>
      )}
    </div>
  );
};
