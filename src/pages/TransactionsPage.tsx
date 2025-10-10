import GeneralPageLayout from '../components/GeneralPageLayout';
import SortableTable from '../components/SortableTable';
import {
  InlineNotification,
  TextInput,
  Select,
  SelectItem,
  DatePicker,
  DatePickerInput,
  Tag,
} from '@carbon/react';
import { transactionHeaders, type TransactionItem } from '../types/transaction';
import { useTransactions } from '../hooks/useTransactions';
import { useUsers } from '../hooks/useUsers';

const TransactionsPage = () => {
  const {
    rows,
    // loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    q,
    setQ,
    totalItems,
    transactionType,
    setTransactionType,
    batchId,
    setBatchId,
    userId,
    setUserId,
    // startDate,
    setStartDate,
    // endDate,
    setEndDate,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
  } = useTransactions();

  const { users, loading: usersLoading } = useUsers();

  // Format date as requested: 9/12/2025 9:48 pm
  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
  };

  // Format status with appropriate styling
  const formatStatus = (status: string) => {
    const statusConfig = {
      completed: { type: 'green', text: 'Completed' },
      pending: { type: 'blue', text: 'Pending' },
      declined: { type: 'red', text: 'Declined' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      type: 'gray',
      text: status,
    };

    return (
      <Tag type={config.type as any} size="sm">
        {config.text}
      </Tag>
    );
  };

  // Simplified expanded row content - only showing notes
  const renderExpandedRow = (rowData: TransactionItem) => (
    <div className="p-6" style={{ backgroundColor: 'var(--cds-layer-accent)' }}>
      {rowData.notes ? (
        <div>
          <h4 className="font-semibold text-lg mb-3">Notes</h4>
          <div
            className="p-4 rounded-md"
            style={{ backgroundColor: 'var(--cds-layer)' }}
          >
            <p className="text-sm">{rowData.notes}</p>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500">
            No notes available for this transaction.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: 'PIMS', href: '/' },
        { label: 'Transactions', isCurrentPage: true },
      ]}
      title=""
      showExportButton={false}
      onExportClick={() => console.log('Export clicked')}
    >
      {error && (
        <div className="mx-6 mb-4">
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            hideCloseButton={false}
            onCloseButtonClick={() => {}}
          />
        </div>
      )}

      <SortableTable<TransactionItem>
        title="Transaction History"
        headers={transactionHeaders}
        data={rows}
        filterOptions={[]}
        customFilters={() => true}
        enableSearch={false}
        expandedRowContent={renderExpandedRow}
        renderCell={(row, key) => {
          if (key === 'transactionDate') {
            return formatTransactionDate(row.transactionDate);
          }
          if (key === 'status') {
            return formatStatus(row.status);
          }
          return (row as any)[key];
        }}
        controlled={{
          page,
          pageSize: limit,
          totalItems,
          onPageChange: setPage,
          onPageSizeChange: setLimit,
          sortColumn: sortBy,
          sortDirection: sortDir.toUpperCase() as 'ASC' | 'DESC',
          onSort: (col, dir) => {
            const allowed = ['id', 'transactionDate'] as const;
            if (!(allowed as readonly string[]).includes(col)) return;
            setSortBy(col as any);
            setSortDir(dir.toLowerCase() as 'asc' | 'desc');
            setPage(1); // Reset to first page when sorting changes
          },
          search: q,
          onSearchChange: setQ,
          activeFilter: transactionType,
          onFilterChange: setTransactionType,
        }}
        customFilterSection={
          <div>
            {/* Top Row - Date Filters */}
            <div className="mb-4 flex flex-wrap gap-4 items-end">
              <div className="min-w-80">
                <DatePicker
                  datePickerType="range"
                  onChange={(dates: any) => {
                    const [start, end] = dates || [];
                    setStartDate(
                      start ? start.toISOString().split('T')[0] : '',
                    );
                    setEndDate(end ? end.toISOString().split('T')[0] : '');
                  }}
                >
                  <DatePickerInput
                    id="start-date"
                    labelText="From"
                    placeholder="mm/dd/yyyy"
                  />
                  <DatePickerInput
                    id="end-date"
                    labelText="To"
                    placeholder="mm/dd/yyyy"
                  />
                </DatePicker>
              </div>
            </div>

            {/* Bottom Row - Filters on left, Search on right */}
            <div className="mb-4 flex flex-wrap gap-4 items-end justify-between">
              {/* Left side - Other Filters */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="min-w-48">
                  <TextInput
                    id="batch-id-filter"
                    labelText="Batch ID"
                    placeholder="Enter batch ID..."
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                  />
                </div>
                <div className="min-w-48">
                  <Select
                    id="user-filter"
                    labelText="User"
                    value={userId ? String(userId) : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserId(value ? Number(value) : undefined);
                    }}
                    disabled={usersLoading}
                  >
                    <SelectItem value="" text="All Users" />
                    {users.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={String(user.value)}
                        text={user.text}
                      />
                    ))}
                  </Select>
                </div>
                <div className="min-w-48">
                  <Select
                    id="transaction-type-filter"
                    labelText="Transaction Type"
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                  >
                    <SelectItem value="" text="All Types" />
                    <SelectItem value="sale" text="Sale" />
                    <SelectItem value="inbound" text="Inbound" />
                    <SelectItem
                      value="positive return"
                      text="Positive Return"
                    />
                    <SelectItem
                      value="negative return"
                      text="Negative Return"
                    />
                  </Select>
                </div>
              </div>

              {/* Right side - Search Bar */}
              <div className="min-w-64">
                <TextInput
                  id="search-input"
                  labelText="Search"
                  placeholder="Search in notes..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
          </div>
        }
        // sortableKeys={['id', 'transactionDate']} // Removed - not supported by SortableTable
      />
    </GeneralPageLayout>
  );
};

export default TransactionsPage;
