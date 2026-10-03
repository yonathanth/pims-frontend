import React, { useState, useMemo } from 'react';
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
  TextArea,
} from '@carbon/react';
import { Renew, Time, Checkmark, Close } from '@carbon/icons-react';
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
    approveSaleGroup,
    declineSaleGroup,
  } = usePendingSales();

  // Split into grouped sales (with saleId) and legacy single-line sales (no saleId)
  const { groupedSaleGroups, legacySales } = useMemo(() => {
    const groupedMap = new Map<number, typeof pendingSales>();
    const legacy: typeof pendingSales = [];

    pendingSales.forEach((sale) => {
      if (sale.saleId) {
        const existing = groupedMap.get(sale.saleId) ?? [];
        groupedMap.set(sale.saleId, [...existing, sale]);
      } else {
        legacy.push(sale);
      }
    });

    const groupedSaleGroups = Array.from(groupedMap.entries()).map(
      ([saleId, items]) => ({
        saleId,
        items,
      }),
    );

    return { groupedSaleGroups, legacySales: legacy };
  }, [pendingSales]);

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
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Pending Sales (0)</h2>
            <p
              className="text-sm"
              style={{ color: 'var(--cds-text-secondary)' }}
            >
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

        <div className="flex-1 flex items-center justify-center">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">
            Pending Sales ({groupedSaleGroups.length + legacySales.length})
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
        {/* Grouped sales (new flow) */}
        {groupedSaleGroups.map((group) => (
          <SaleGroupCard
            key={group.saleId}
            saleGroupId={group.saleId}
            items={group.items}
            onApproveGroup={approveSaleGroup}
            onDeclineGroup={declineSaleGroup}
          />
        ))}

        {/* Legacy single-line sales (no saleId) */}
        {legacySales.map((sale) => (
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

interface SaleGroupCardProps {
  saleGroupId: number;
  items: ReturnType<typeof usePendingSales>['pendingSales'];
  onApproveGroup: (saleId: number) => Promise<void>;
  onDeclineGroup: (saleId: number, reason: string) => Promise<void>;
}

const SaleGroupCard: React.FC<SaleGroupCardProps> = ({
  saleGroupId,
  items,
  onApproveGroup,
  onDeclineGroup,
}) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const first = items[0];
  const totalAmount = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(amount);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await onApproveGroup(saleGroupId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to approve sale group',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      setError('Please provide a reason for declining');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onDeclineGroup(saleGroupId, declineReason);
      setShowDeclineModal(false);
      setDeclineReason('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to decline sale group',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
      style={{
        backgroundColor: 'var(--cds-field-01)',
        borderColor: 'var(--cds-border-subtle)',
      }}
    >
      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onClose={() => setError(null)}
          className="mb-2"
        />
      )}

      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">
              Sale Group #{saleGroupId}
            </h3>
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor: 'var(--cds-tag-background-gray)',
                color: 'var(--cds-text-secondary)',
              }}
            >
              {items.length} item{items.length > 1 ? 's' : ''}
            </span>
          </div>

          <div
            className="text-sm mb-2"
            style={{ color: 'var(--cds-text-secondary)' }}
          >
            <span className="font-medium">Customer:</span>{' '}
            {first.customerName}
          </div>

          <div className="text-sm mb-2">
            <span className="font-medium">Total Qty:</span> {totalQty}{' '}
            <span className="font-medium ml-4">Total Amount:</span>{' '}
            <span className="font-bold">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div
            className="text-xs mb-2"
            style={{ color: 'var(--cds-text-secondary)' }}
          >
            Created at {formatDate(first.createdAt)}
          </div>

          {/* Items preview */}
          <div className="mt-2 space-y-1 text-sm">
            {items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between gap-2">
                <div className="truncate">
                  <span className="font-medium">{item.drugName}</span>{' '}
                  <span className="text-xs text-gray-500">
                    (SKU: {item.sku}, Batch: {item.batchNumber})
                  </span>
                </div>
                <div className="whitespace-nowrap">
                  Qty: {item.quantity} |{' '}
                  {formatCurrency(item.totalPrice)}
                </div>
              </div>
            ))}
            {items.length > 3 && (
              <div
                className="text-xs text-gray-500"
                style={{ color: 'var(--cds-text-secondary)' }}
              >
                + {items.length - 3} more item
                {items.length - 3 > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="w-40 flex flex-col gap-1 flex-shrink-0">
          <Button
            kind="primary"
            size="sm"
            renderIcon={Checkmark}
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 w-full text-xs"
          >
            {loading ? 'Processing...' : 'Approve Group'}
          </Button>
          <Button
            kind="danger"
            size="sm"
            renderIcon={Close}
            onClick={() => setShowDeclineModal(true)}
            disabled={loading}
            className="flex-1 w-full text-xs"
          >
            Decline Group
          </Button>
        </div>
      </div>

      {/* Decline Modal */}
      <ComposedModal
        open={showDeclineModal}
        onClose={() => {
          setShowDeclineModal(false);
          setDeclineReason('');
          setError(null);
        }}
      >
        <ModalHeader label="" title="Decline Sale Group" />
        <ModalBody>
          <div>
            <p className="mb-4">
              Decline sale group <b>#{saleGroupId}</b> with{' '}
              <b>{items.length}</b> item
              {items.length > 1 ? 's' : ''} for{' '}
              <b>{first.customerName}</b>?
            </p>
            <TextArea
              labelText="Reason for Declining *"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Please provide a reason for declining this sale group..."
              rows={3}
              className="mb-4"
              required
            />
            {error && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={error}
                hideCloseButton={false}
                onCloseButtonClick={() => setError(null)}
              />
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            kind="secondary"
            onClick={() => {
              setShowDeclineModal(false);
              setDeclineReason('');
              setError(null);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            kind="danger"
            onClick={handleDecline}
            disabled={loading || !declineReason.trim()}
          >
            {loading ? 'Declining...' : 'Decline Group'}
          </Button>
        </ModalFooter>
      </ComposedModal>
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
