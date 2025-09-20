import React, { useState } from 'react';
import {
  Button,
  InlineNotification,
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Select,
  SelectItem,
  Tag,
} from '@carbon/react';
import { Renew, Time } from '@carbon/icons-react';
import { usePendingSales } from '../../../hooks/usePendingSales';
import { useSales } from '../../../hooks/useSales';
import { PendingSaleCard } from './PendingSaleCard';

export const PendingSalesStack: React.FC = () => {
  const {
    pendingSales,
    loading,
    error,
    refreshPendingSales,
    approveSale,
    declineSale,
  } = usePendingSales();

  if (loading && pendingSales.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: 'var(--cds-text-secondary)' }}>
            Loading pending sales...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4">
        <InlineNotification
          kind="error"
          title="Error Loading Pending Sales"
          subtitle={error}
          onClose={() => window.location.reload()}
        />
      </div>
    );
  }

  if (pendingSales.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Pending Sales
        </h3>
        <p className="mb-4" style={{ color: 'var(--cds-text-secondary)' }}>
          All sales have been processed. New sales will appear here when
          created.
        </p>
        <Button
          kind="secondary"
          renderIcon={Renew}
          onClick={refreshPendingSales}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">
            Pending Sales ({pendingSales.length})
          </h2>
          <p className="text-sm" style={{ color: 'var(--cds-text-secondary)' }}>
            Sales waiting for your approval
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            kind="secondary"
            size="sm"
            renderIcon={Renew}
            onClick={refreshPendingSales}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <HistoryButton />
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {pendingSales.map((sale) => (
          <PendingSaleCard
            key={sale.id}
            sale={sale}
            onApprove={approveSale}
            onDecline={declineSale}
          />
        ))}
      </div>
    </div>
  );
};

// History Button Component
const HistoryButton: React.FC = () => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState('all');

  const { salesData, loading } = useSales({
    limit: 100,
    page: 1,
    search: '',
    status: 'all',
  });

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
        return <Tag type="gray">Pending</Tag>;
      default:
        return <Tag type="gray">{status}</Tag>;
    }
  };

  const filteredAndSortedSales = React.useMemo(() => {
    if (!salesData?.sales) return [];

    let filtered = salesData.sales;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((sale) => sale.status === statusFilter);
    }

    // Sort the data
    return filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'amount':
          aValue = a.totalPrice;
          bValue = b.totalPrice;
          break;
        case 'drug':
          aValue = a.drugName.toLowerCase();
          bValue = b.drugName.toLowerCase();
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [salesData?.sales, sortBy, sortOrder, statusFilter]);

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

  const rows = filteredAndSortedSales.map((sale) => ({
    id: String(sale.id),
    date: formatDate(sale.createdAt),
    drugName: sale.drugName,
    sku: sale.sku,
    quantity: sale.quantity,
    customer: sale.customerName,
    totalPrice: formatCurrency(sale.totalPrice),
    status: getStatusTag(sale.status),
    batch: sale.batchNumber,
  }));

  return (
    <>
      <Button
        kind="secondary"
        size="sm"
        renderIcon={Time}
        onClick={() => setShowHistoryModal(true)}
      >
        History
      </Button>

      <ComposedModal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        size="lg"
      >
        <ModalHeader label="" title="Sales History (Last 100 Transactions)" />
        <ModalBody>
          <div className="mb-4 flex gap-4">
            <div className="w-48">
              <Select
                id="sort-by"
                labelText="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <SelectItem value="date" text="Date" />
                <SelectItem value="amount" text="Amount" />
                <SelectItem value="drug" text="Drug Name" />
              </Select>
            </div>
            <div className="w-32">
              <Select
                id="sort-order"
                labelText="Order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <SelectItem value="desc" text="Newest First" />
                <SelectItem value="asc" text="Oldest First" />
              </Select>
            </div>
            <div className="w-32">
              <Select
                id="status-filter"
                labelText="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <SelectItem value="all" text="All" />
                <SelectItem value="approved" text="Approved" />
                <SelectItem value="declined" text="Declined" />
                <SelectItem value="pending" text="Pending" />
              </Select>
            </div>
          </div>

          <div className="h-96 overflow-auto">
            <DataTable rows={rows} headers={headers} useZebraStyles>
              {({
                rows,
                headers,
                getTableProps,
                getHeaderProps,
                getRowProps,
              }) => (
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
                              Loading sales history...
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
                              <TableCell>{cell.value}</TableCell>
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
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={() => setShowHistoryModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </ComposedModal>
    </>
  );
};
