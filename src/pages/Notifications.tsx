import React, { useState, useMemo, useCallback } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Dropdown,
  Tag,
  Pagination,
} from '@carbon/react';
import {
  Notification,
  ErrorFilled,
  WarningFilled,
  InformationFilled,
  Renew,
  CheckmarkFilled,
} from '@carbon/icons-react';
import useScrollbarStyles from '../hooks/useScrollbarStyles';
import DashboardLayout from './dashboard/layouts/DashboardLayout';
import { useGlobalNotifications } from '../contexts/GlobalNotificationContext';
import { useNotifications } from '../hooks/useNotifications';
import type { ListNotificationsQuery } from '../types/notification';

// Types - Updated to match backend response format
type Severity = 'info' | 'warning' | 'error';

interface NotificationItem {
  id: number;
  type?: string; // can be undefined from backend
  message: string;
  severity: Severity;
  created: string;
  read?: boolean; // read/unread status from backend
}

// Constants - Updated filter items to match backend types
const FILTER_ITEMS = [
  { id: 'all', text: 'All notifications' },
  { id: 'out_of_stock', text: 'Out of Stock' },
  { id: 'low_stock', text: 'Low Stock' },
  { id: 'expired', text: 'Expired' },
  { id: 'near_expiry', text: 'Near Expiry' },
];

const SEVERITY_FILTER_ITEMS = [
  { id: 'all', text: 'All severities' },
  { id: 'high', text: 'High' },
  { id: 'medium', text: 'Medium' },
  { id: 'low', text: 'Low' },
];

const READ_STATUS_FILTER_ITEMS = [
  { id: 'all', text: 'All notifications' },
  { id: 'unread', text: 'Unread only' },
  { id: 'read', text: 'Read only' },
];

// Updated notification styles with blue, yellow, red shades
const NOTIFICATION_STYLES = {
  info: {
    background: 'rgba(59, 130, 246, 0.1)', // Blue shade
    borderColor: '#3B82F6', // Blue
    tagType: 'blue' as const,
    icon: InformationFilled,
  },
  warning: {
    background: 'rgba(251, 191, 36, 0.1)', // Yellow shade
    borderColor: '#FBB928', // Yellow
    tagType: 'gray' as const, // Use gray instead of yellow since Carbon doesn't support yellow
    icon: WarningFilled,
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)', // Red shade
    borderColor: '#EF4444', // Red
    tagType: 'red' as const,
    icon: ErrorFilled,
  },
};

// Updated notification labels to match backend types
const NOTIFICATION_LABELS = {
  out_of_stock: 'Out of Stock',
  low_stock: 'Low Stock',
  expired: 'Expired',
  near_expiry: 'Near Expiry',
};

// Updated type mapping to match backend response
// const TYPE_MAP = {
//   out_of_stock: 'out_of_stock',
//   low_stock: 'low_stock',
//   expired: 'expired',
//   near_expiry: 'near_expiry',
// } as const;

// Updated urgency order for sorting
// const URGENCY_ORDER = {
//   expired: 1,
//   out_of_stock: 2,
//   near_expiry: 3,
//   low_stock: 4,
// };

/*const EXPIRY_UNIT_OPTIONS = [
  { id: 'days', text: 'Days' },
  { id: 'months', text: 'Months' }
];*/

// Components
const NotificationCard = React.memo(
  ({
    notification,
    onMarkAsRead,
  }: {
    notification: NotificationItem;
    onMarkAsRead: (id: number) => void;
  }) => {
    const style = NOTIFICATION_STYLES[notification.severity];
    const Icon = style.icon;

    // Format date from backend timestamp
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
      if (diffInHours < 48) return 'Yesterday';
      return date.toLocaleDateString();
    };

    return (
      <div
        className={`border-l-6 flex items-start p-5 px-8 mb-3 rounded-md shadow-sm transition-all duration-200 ${notification.read ? 'opacity-75' : ''}`}
        style={{
          borderLeftColor: style.borderColor,
          background: style.background,
        }}
      >
        <Icon
          size={22}
          className="mr-4 mt-1"
          style={{ color: style.borderColor }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Tag type={style.tagType} size="sm">
              {notification.type
                ? NOTIFICATION_LABELS[
                    notification.type as keyof typeof NOTIFICATION_LABELS
                  ] || notification.type.toUpperCase()
                : 'UNKNOWN'}
            </Tag>
            <span className="font-semibold text-base">
              {notification.severity.toUpperCase()}
            </span>
            <span
              className="text-sm"
              style={{ color: 'var(--cds-text-secondary)' }}
            >
              {formatDate(notification.created)}
            </span>
          </div>
          <div
            className="text-base mt-1"
            style={{ color: 'var(--cds-text-secondary)' }}
          >
            {notification.message}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {notification.read && (
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#2563EB',
              }}
            >
              <CheckmarkFilled size={12} />
              Read
            </span>
          )}
          {!notification.read && (
            <Button
              kind="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
            >
              Mark as read
            </Button>
          )}
        </div>
      </div>
    );
  },
);

/*const ConfigureAlertsModal = React.memo(({ 
  open, 
  onClose, 
  stockThreshold, 
  setStockThreshold, 
  expiryValue, 
  setExpiryValue, 
  expiryUnit, 
  setExpiryUnit 
}: {
  open: boolean;
  onClose: () => void;
  stockThreshold: string;
  setStockThreshold: (value: string) => void;
  expiryValue: string;
  setExpiryValue: (value: string) => void;
  expiryUnit: { id: string; text: string };
  setExpiryUnit: (value: { id: string; text: string }) => void;
}) => (
  <Modal
  open={open}
  modalHeading="Configure Alerts"
    passiveModal={false}
    onRequestClose={onClose}
    preventCloseOnClickOutside={false}
    primaryButtonText="Finish"
    onRequestSubmit={onClose}
  >
  <div className="pt-8 px-4 pb-4 max-w-sm w-full mx-auto" style={{ backgroundColor: 'var(--cds-layer)' }}>
      <div className="mb-8">
        <div className="font-semibold text-lg mb-2">
          Alert when stock falls below
        </div>
        <div className="flex items-center gap-2">
          <TextInput
            id="stock-threshold"
            labelText="Stock threshold"
            placeholder="Enter number"
            value={stockThreshold}
            type="number"
            min="0"
            onChange={e => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) setStockThreshold(val);
            }}
            autoComplete="off"
          />
          <span className="text-base ml-1">units</span>
        </div>
      </div>
      <div className="mb-8">
        <div className="font-semibold text-lg mb-2">
          Alert days before expiration
        </div>
        <div className="flex items-center gap-2">
          <TextInput
            id="expiry-value"
            labelText="Expiry value"
            placeholder="Enter number"
            value={expiryValue}
            type="number"
            min="0"
            onChange={e => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) setExpiryValue(val);
            }}
            autoComplete="off"
              const val = e.target.value;
              if (/^\d*$/.test(val)) setExpiryValue(val);
            }}
          />
          <Dropdown
            id="expiry-unit"
            items={EXPIRY_UNIT_OPTIONS}
            itemToString={item => item?.text || ''}
            selectedItem={expiryUnit}
            label="Days"
            titleText="Days"
            size="md"
            onChange={({ selectedItem }) => selectedItem && setExpiryUnit(selectedItem)}
          />
        </div>
      </div>
    </div>
  </Modal>
));*/

const Notifications = () => {
  useScrollbarStyles();

  // Get global notification context
  const { forceRefresh } = useGlobalNotifications();

  // Refresh global counts when notifications page loads
  React.useEffect(() => {
    forceRefresh();
  }, [forceRefresh]);

  // Filter states
  const [selectedType, setSelectedType] = useState(FILTER_ITEMS[0]);
  const [selectedSeverity, setSelectedSeverity] = useState(
    SEVERITY_FILTER_ITEMS[0],
  );
  const [selectedReadStatus, setSelectedReadStatus] = useState(
    READ_STATUS_FILTER_ITEMS[0],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Build query object
  const query: ListNotificationsQuery = useMemo(() => {
    const q: ListNotificationsQuery = {
      page: currentPage,
      limit: pageSize,
    };

    if (selectedType.id !== 'all') {
      q.type = selectedType.id as any;
    }

    if (selectedSeverity.id !== 'all') {
      q.severity = selectedSeverity.id as any;
    }

    if (selectedReadStatus.id === 'unread') {
      q.isRead = false;
    } else if (selectedReadStatus.id === 'read') {
      q.isRead = true;
    }

    return q;
  }, [
    selectedType.id,
    selectedSeverity.id,
    selectedReadStatus.id,
    currentPage,
    pageSize,
  ]);

  // Backend data
  const {
    notifications,
    counts,
    pagination,
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useNotifications(query);

  // Debug logging
  console.log('Notifications loaded:', notifications.length, notifications);
  console.log('Pagination:', pagination);
  console.log('Counts:', counts);

  const unreadCount = counts?.unread || 0;

  const handleMarkAsRead = useCallback(
    async (id: number) => {
      try {
        await markAsRead(id);
        // Force refresh global notification counts
        forceRefresh();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [markAsRead, forceRefresh],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      // Force refresh global notification counts
      forceRefresh();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [markAllAsRead, forceRefresh]);

  const handlePageChange = useCallback(({ page }: { page: number }) => {
    setCurrentPage(page);
  }, []);

  // const _unused_handlePageSizeChange = useCallback(
  //   ({ pageSize: newPageSize }: { pageSize: number }) => {
  //     setPageSize(newPageSize);
  //     setCurrentPage(1); // Reset to first page when changing page size
  //   },
  //   [],
  // );

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div
          className="cds--grid cds--grid--full-width min-h-screen p-0 overflow-x-hidden"
          style={{ backgroundColor: 'var(--cds-background)' }}
        >
          <div className="cds--row w-full justify-center mt-6">
            <div className="cds--col-lg-16 cds--col-md-16 cds--col-sm-16 mx-auto max-w-full px-6">
              <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading notifications...</div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div
          className="cds--grid cds--grid--full-width min-h-screen p-0 overflow-x-hidden"
          style={{ backgroundColor: 'var(--cds-background)' }}
        >
          <div className="cds--row w-full justify-center mt-6">
            <div className="cds--col-lg-16 cds--col-md-16 cds--col-sm-16 mx-auto max-w-full px-6">
              <div className="flex justify-center items-center h-64 flex-col gap-4">
                <div className="text-lg text-red-600">
                  Failed to load notifications
                </div>
                <Button onClick={refetch}>Retry</Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div
        className="cds--grid cds--grid--full-width min-h-screen p-0 overflow-x-hidden"
        style={{ backgroundColor: 'var(--cds-background)' }}
      >
        <div className="cds--row w-full justify-center mt-6">
          <div className="cds--col-lg-16 cds--col-md-16 cds--col-sm-16 mx-auto max-w-full px-6">
            {/* Header and filters */}
            <div
              className="pb-4 px-6"
              style={{ backgroundColor: 'var(--cds-layer)' }}
            >
              <div className="cds--breadcrumb-container mb-4 pt-6">
                <Breadcrumb>
                  <BreadcrumbItem href="/">PIMS</BreadcrumbItem>
                  <BreadcrumbItem isCurrentPage>Notifications</BreadcrumbItem>
                </Breadcrumb>
              </div>
              <div className="flex justify-between items-center mb-8 gap-12">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Notification size={32} />
                    <span
                      className="absolute -top-1.5 -right-1.5 rounded-full min-w-[22px] h-[22px] text-xs font-bold flex items-center justify-center shadow-sm z-10"
                      style={{
                        backgroundColor: 'var(--cds-support-error)',
                        color: 'var(--cds-text-on-color)',
                      }}
                    >
                      {unreadCount}
                    </span>
                  </div>
                  <h1 className="cds--productive-heading-05">Notifications</h1>
                  {counts && (
                    <div
                      className="flex gap-4 text-sm"
                      style={{ color: 'var(--cds-text-secondary)' }}
                    >
                      <span>Total: {counts.total}</span>
                      <span>Unread: {counts.unread}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    kind="secondary"
                    size="md"
                    onClick={handleMarkAllAsRead}
                    disabled={loading || unreadCount === 0}
                  >
                    Mark all as read
                  </Button>
                  <Button
                    kind="primary"
                    renderIcon={Renew}
                    size="md"
                    onClick={() => {
                      refetch();
                      forceRefresh();
                    }}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="flex gap-6 w-full flex-wrap">
                <div className="flex-1 min-w-0 max-w-xs">
                  <Dropdown
                    id="type-dropdown"
                    items={FILTER_ITEMS}
                    itemToString={(item) => item?.text || ''}
                    selectedItem={selectedType}
                    label="Notification Type"
                    titleText="Notification Type"
                    size="md"
                    onChange={({ selectedItem }) =>
                      selectedItem && setSelectedType(selectedItem)
                    }
                  />
                </div>
                <div className="flex-1 min-w-0 max-w-xs">
                  <Dropdown
                    id="severity-dropdown"
                    items={SEVERITY_FILTER_ITEMS}
                    itemToString={(item) => item?.text || ''}
                    selectedItem={selectedSeverity}
                    label="Severity"
                    titleText="Severity"
                    size="md"
                    onChange={({ selectedItem }) =>
                      selectedItem && setSelectedSeverity(selectedItem)
                    }
                  />
                </div>
                <div className="flex-1 min-w-0 max-w-xs">
                  <Dropdown
                    id="read-status-dropdown"
                    items={READ_STATUS_FILTER_ITEMS}
                    itemToString={(item) => item?.text || ''}
                    selectedItem={selectedReadStatus}
                    label="Read Status"
                    titleText="Read Status"
                    size="md"
                    onChange={({ selectedItem }) =>
                      selectedItem && setSelectedReadStatus(selectedItem)
                    }
                  />
                </div>
                <div className="flex-1 min-w-0 max-w-xs">
                  <Dropdown
                    id="page-size-dropdown"
                    items={[
                      { id: '10', text: '10 per page' },
                      { id: '20', text: '20 per page' },
                      { id: '50', text: '50 per page' },
                    ]}
                    itemToString={(item) => item?.text || ''}
                    selectedItem={{
                      id: pageSize.toString(),
                      text: `${pageSize} per page`,
                    }}
                    label="Page Size"
                    titleText="Page Size"
                    size="md"
                    onChange={({ selectedItem }) =>
                      selectedItem && setPageSize(parseInt(selectedItem.id))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Notifications list */}
            <div className="px-6">
              {notifications.length === 0 && !loading ? (
                <div className="flex justify-center items-center h-64 flex-col gap-4">
                  <div
                    className="text-lg"
                    style={{ color: 'var(--cds-text-secondary)' }}
                  >
                    No notifications found
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: 'var(--cds-text-secondary)' }}
                  >
                    Try adjusting your filters or check back later
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="cds--productive-heading-03 mb-4">
                      Notifications ({notifications.length} of{' '}
                      {pagination?.totalItems || 0})
                    </h3>
                    {notifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <Pagination
                        page={pagination.page}
                        pageSize={pagination.limit}
                        pageSizes={[10, 20, 50]}
                        totalItems={pagination.totalItems}
                        onChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
