import GeneralPageLayout from '../components/GeneralPageLayout';
import SortableTable from '../components/SortableTable';
import {
  InlineNotification,
  TextInput,
  DatePicker,
  DatePickerInput,
} from '@carbon/react';
import { auditLogHeaders, type AuditLogItem } from '../data/auditLogData';
import { useAuditLogs } from '../hooks/useAuditLogs';

const AuditLogPage = () => {
  const {
    rows,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    // q,
    // setQ,
    totalItems,
    entityName,
    setEntityName,
    // action,
    // setAction,
    userId,
    setUserId,
    entityId,
    setEntityId,
    // startDate,
    setStartDate,
    // endDate,
    setEndDate,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
  } = useAuditLogs();

  // Expanded row content for audit log details
  const renderExpandedRow = (rowData: AuditLogItem) => (
    <div className="p-6" style={{ backgroundColor: 'var(--cds-layer-accent)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-lg mb-3">Audit Details</h4>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Description:</span>{' '}
              {rowData.details.description}
            </p>
            {rowData.details.oldValue && (
              <p>
                <span className="font-medium">Previous Value:</span>{' '}
                {rowData.details.oldValue}
              </p>
            )}
            {rowData.details.newValue && (
              <p>
                <span className="font-medium">New Value:</span>{' '}
                {rowData.details.newValue}
              </p>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-3">System Information</h4>
          <div className="space-y-2">
            <p>
              <span className="font-medium">IP Address:</span>{' '}
              {rowData.details.ipAddress}
            </p>
            <p>
              <span className="font-medium">User Agent:</span>{' '}
              {rowData.details.userAgent}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: 'PIMS', href: '/' },
        { label: 'Audit', isCurrentPage: true },
      ]}
      showExportButton={false}
    >
      <div>
        {/* Top row filters: Report Type, Action, and Date Range */}
        <div className="px-6 mb-4 flex flex-wrap gap-4 items-end">
          <div className="min-w-80">
            <DatePicker
              datePickerType="range"
              onChange={(dates: any) => {
                const [start, end] = dates || [];
                setStartDate(
                  start ? new Date(start).toISOString().slice(0, 10) : '',
                );
                setEndDate(end ? new Date(end).toISOString().slice(0, 10) : '');
                setPage(1);
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

        {/* Bottom row filters: Entity Name, User ID, Entity ID */}
        <div className="px-6 mb-4 flex flex-wrap gap-4 items-end">
          <div className="min-w-48">
            <TextInput
              id="entityName"
              labelText="Entity Name"
              value={entityName}
              onChange={(e: any) => {
                setEntityName(e.target.value);
                setPage(1);
              }}
              autoComplete="off"
            />
          </div>
          <div className="min-w-48">
            <TextInput
              id="userId"
              labelText="User ID"
              value={userId}
              onChange={(e: any) => {
                setUserId(e.target.value);
                setPage(1);
              }}
              autoComplete="off"
            />
          </div>
          <div className="min-w-48">
            <TextInput
              id="entityId"
              labelText="Entity ID"
              value={entityId}
              onChange={(e: any) => {
                setEntityId(e.target.value);
                setPage(1);
              }}
              autoComplete="off"
            />
          </div>
        </div>

        <SortableTable<AuditLogItem>
          title=""
          headers={auditLogHeaders}
          data={rows}
          filterOptions={[]}
          enableSearch={false}
          expandedRowContent={renderExpandedRow}
          controlled={{
            page,
            pageSize: limit,
            totalItems,
            onPageChange: (p) => setPage(p),
            onPageSizeChange: (s) => setLimit(s),
            sortColumn: sortBy,
            sortDirection: sortDir.toUpperCase() as 'ASC' | 'DESC',
            onSort: (col, dir) => {
              const allowed = ['id', 'timestamp'] as const;
              if (!(allowed as readonly string[]).includes(col)) return;
              setSortBy(col as any);
              setSortDir(dir.toLowerCase() as 'asc' | 'desc');
              setPage(1); // Reset to first page when sorting changes
            },
            search: '',
            onSearchChange: () => {},
            activeFilter: '',
            onFilterChange: () => {},
            sortableKeys: ['id', 'timestamp'],
          }}
        />
        {loading && (
          <div
            className="px-6 py-2 text-sm"
            style={{ color: 'var(--cds-text-secondary)' }}
          >
            Loading audit logs...
          </div>
        )}
        {error && (
          <div className="mx-6 mb-4">
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              hideCloseButton={false}
            />
          </div>
        )}
      </div>
    </GeneralPageLayout>
  );
};

export default AuditLogPage;
