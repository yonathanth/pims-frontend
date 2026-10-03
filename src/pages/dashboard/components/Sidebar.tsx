import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderMenuButton,
  SideNav,
  SideNavItems,
  SideNavLink,
} from '@carbon/react';
import {
  Notification,
  Home,
  InventoryManagement,
  UserAdmin,
  ShoppingCart,
  Report,
  DocumentTasks,
  Package,
  Logout,
  DirectoryDomain,
  DocumentMultiple_01,
  UserRole,
  Upload,
  Receipt,
  Settings,
} from '@carbon/icons-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import NotificationBadge from '../../../components/NotificationBadge';
import { useGlobalNotifications } from '../../../contexts/GlobalNotificationContext';
import { restoreBackup, checkExistingData, type ExistingDataCheck } from '../../../api/backup';
import { getUploadStatus, triggerUpload, type AnalyticsUploadStatus } from '../../../api/analytics';
import {
  Modal,
  FileUploader,
  InlineNotification,
} from '@carbon/react';

// Header component that uses the global notification context
const HeaderWithNotifications = () => {
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);
  const navigate = useNavigate();
  const { logout, session } = useAuth();
  const { unreadCount } = useGlobalNotifications();

  // Backup/Restore state
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingData, setExistingData] = useState<ExistingDataCheck | null>(null);

  // Analytics upload state
  const [uploadStatus, setUploadStatus] = useState<AnalyticsUploadStatus | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadNotification, setUploadNotification] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [isUploadButtonHovered, setIsUploadButtonHovered] = useState(false);

  const userRole = session?.user?.role;

  // Check existing data when modal opens
  useEffect(() => {
    if (restoreModalOpen && (userRole === 'ADMIN' || userRole === 'MANAGER')) {
      checkExistingData()
        .then((data) => setExistingData(data))
        .catch((error) => console.error('Failed to check existing data:', error));
    }
  }, [restoreModalOpen, userRole]);

  // Fetch upload status on mount and periodically
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getUploadStatus();
        console.log('📊 Upload status fetched:', {
          lastSuccessAt: status.lastSuccessAt,
          running: status.running,
          lastError: status.lastError,
          fullStatus: status,
        });
        setUploadStatus(status);
      } catch (error) {
        console.error('❌ Failed to fetch upload status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login even if logout API fails
      navigate('/login');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.dump')) {
        setRestoreError('Please select a valid .dump backup file');
        return;
      }
      setSelectedFile(file);
      setRestoreError(null);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile) return;

    setRestoreLoading(true);
    setRestoreError(null);
    setRestoreSuccess(null);
    try {
      await restoreBackup(selectedFile);
      setRestoreSuccess('Database restored successfully! Please refresh the page.');
      setTimeout(() => {
        setRestoreModalOpen(false);
        setSelectedFile(null);
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setRestoreError(error.message || 'Failed to restore backup');
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleUploadAnalytics = async () => {
    setUploading(true);
    setUploadNotification(null);
    try {
      console.log('🔄 Triggering analytics upload...');
      const result = await triggerUpload(false);
      console.log('📤 Upload result:', result);
      
      if (result.outcome === 'uploaded') {
        setUploadNotification({ kind: 'success', message: result.message || 'Analytics uploaded successfully!' });
      } else if (result.outcome === 'skipped-no-change') {
        setUploadNotification({ kind: 'success', message: 'No changes to upload' });
      } else {
        setUploadNotification({ kind: 'error', message: result.message || 'Upload failed' });
      }
      
      // Refresh status after a short delay to ensure backend has updated
      setTimeout(async () => {
        try {
          const status = await getUploadStatus();
          console.log('📊 Status after upload:', status);
          setUploadStatus(status);
        } catch (error) {
          console.error('Failed to refresh status after upload:', error);
        }
      }, 1000);
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      setUploadNotification({ kind: 'error', message: error.message || 'Failed to upload analytics' });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadNotification(null), 5000);
    }
  };

  const formatLastUpdated = (timestamp: string | null | undefined): string => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''}`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <>
      {/* Global Header */}
      <Header aria-label="Pharma Dashboard">
        <HeaderMenuButton
          aria-label="Open menu"
          onClick={() => setIsSideNavExpanded(!isSideNavExpanded)}
          isActive={isSideNavExpanded}
          isCollapsible={true}
        />
        <HeaderName
          prefix="PIMS"
          onClick={() => {
            if (userRole === 'SELLER') {
              navigate('/dashboard/cashier');
            } else if (userRole === 'ADMIN' || userRole === 'MANAGER') {
              navigate('/dashboard/admin');
            } else {
              navigate('/dashboard');
            }
          }}
        >
          {userRole === 'SELLER'
            ? 'Cashier'
            : userRole === 'ADMIN' || userRole === 'MANAGER'
              ? 'Admin Dashboard'
              : 'Dashboard'}
        </HeaderName>

        {/* Right side icons */}
        <HeaderGlobalBar>
          {/* <HeaderGlobalAction
            aria-label="Search"
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
          >
            <Search labelText="Search" />
          </HeaderGlobalAction>
            {/* Search Component */}
          {/* {isSearchOpen && (
            <div className="absolute top-16 right-6 bg-white shadow-md p-4 rounded-md z-50">
              <Search
                id="header-search"
                labelText="Search"
                placeholder="Search..."
                size="lg"
                onChange={(e) => console.log(e.target.value)}
              />
            </div>
          )} */}
          {userRole !== 'SELLER' && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <HeaderGlobalAction
                aria-label="Notifications"
                onClick={() => navigate('/notifications')}
              >
                <Notification size={20} />
              </HeaderGlobalAction>
              <NotificationBadge count={unreadCount} />
            </div>
          )}

          {/* Upload Analytics Button - Available to all authenticated users */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}
            onMouseEnter={() => setIsUploadButtonHovered(true)}
            onMouseLeave={() => setIsUploadButtonHovered(false)}
          >
            <div
              style={{
                opacity: (uploading || uploadStatus?.running) ? 0.5 : 1,
                cursor: (uploading || uploadStatus?.running) ? 'not-allowed' : 'pointer',
                pointerEvents: (uploading || uploadStatus?.running) ? 'none' : 'auto',
              }}
            >
              <HeaderGlobalAction
                aria-label={`Upload Analytics${uploadStatus?.lastError ? ` - Error: ${uploadStatus.lastError.substring(0, 50)}` : ''}`}
                onClick={() => {
                  if (!uploading && !uploadStatus?.running) {
                    handleUploadAnalytics();
                  }
                }}
              >
                <Upload size={20} />
              </HeaderGlobalAction>
            </div>
            {uploadStatus?.lastSuccessAt && !isUploadButtonHovered && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--cds-text-secondary)',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.5',
                  cursor: 'default',
                }}
                title={`Last uploaded: ${new Date(uploadStatus.lastSuccessAt).toLocaleString()}`}
              >
                {formatLastUpdated(uploadStatus.lastSuccessAt)}
              </span>
            )}
          </div>

          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <HeaderGlobalAction
              aria-label="Settings"
              onClick={() => navigate('/settings')}
            >
              <Settings size={20} />
            </HeaderGlobalAction>
          )}

          <HeaderGlobalAction aria-label="Logout" onClick={handleLogout}>
            <Logout size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      {/* Sidebar */}
      <SideNav
        isFixedNav={false}
        isRail={true}
        enterDelayMs={100}
        isChildOfHeader
        expanded={isSideNavExpanded}
        aria-label="Side navigation"
      >
        <SideNavItems>
          {/* Home - hide for SELLER */}
          {userRole !== 'SELLER' && (
            <SideNavLink
              onClick={() => {
                if (userRole === 'ADMIN' || userRole === 'MANAGER') {
                  navigate('/dashboard/admin');
                } else {
                  navigate('/dashboard');
                }
              }}
              renderIcon={Home}
            >
              Home
            </SideNavLink>
          )}
          {/* Inventory - Admin and Manager only (Pharmacist uses Home) */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/inventory')}
              renderIcon={InventoryManagement}
            >
              Inventory
            </SideNavLink>
          )}
          {/* Categories - Admin, Manager, Pharmacist */}
          {(userRole === 'ADMIN' ||
            userRole === 'MANAGER' ||
            userRole === 'PHARMACIST') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/categories')}
              renderIcon={DocumentMultiple_01}
            >
              Categories
            </SideNavLink>
          )}
          {/* Unit Types - Admin, Manager, Pharmacist */}
          {(userRole === 'ADMIN' ||
            userRole === 'MANAGER' ||
            userRole === 'PHARMACIST') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/unit-types')}
              renderIcon={Package}
            >
              Unit Types
            </SideNavLink>
          )}
          {/* Locations - Admin and Manager only */}
          {(userRole === 'ADMIN' ||
            userRole === 'MANAGER' ||
            userRole === 'PHARMACIST') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/locations')}
              renderIcon={DirectoryDomain}
            >
              Locations
            </SideNavLink>
          )}
          {/* Suppliers - Admin and Manager only */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/suppliers')}
              renderIcon={Package}
            >
              Suppliers
            </SideNavLink>
          )}
          {/* Employees - Admin only */}
          {userRole === 'ADMIN' && (
            <SideNavLink
              onClick={() => navigate('/dashboard/employees')}
              renderIcon={UserAdmin}
            >
              Employees
            </SideNavLink>
          )}
          {/* Products - Admin, Manager, Pharmacist */}
          {(userRole === 'ADMIN' ||
            userRole === 'MANAGER' ||
            userRole === 'PHARMACIST') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/products')}
              renderIcon={ShoppingCart}
            >
              Products
            </SideNavLink>
          )}
          {/* Orders - Admin and Manager only */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/orders')}
              renderIcon={DocumentTasks}
            >
              Orders
            </SideNavLink>
          )}
          {/* Reports - Admin and Manager only */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/reports')}
              renderIcon={Report}
            >
              Reports
            </SideNavLink>
          )}
          {/* Audit Log - Admin and Manager only */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/audit')}
              renderIcon={DocumentTasks}
            >
              Audit Log
            </SideNavLink>
          )}
          {/* Transactions - Admin and Manager only */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/transactions')}
              renderIcon={DocumentTasks}
            >
              Transactions
            </SideNavLink>
          )}
          {/* Analytics - Admin and Manager only */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/analytics')}
              renderIcon={Report}
            >
              Analytics
            </SideNavLink>
          )}
          {/* Sales - Admin, Manager, Pharmacist, Seller */}
          {(userRole === 'ADMIN' ||
            userRole === 'MANAGER' ||
            userRole === 'PHARMACIST' ||
            userRole === 'SELLER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/sales')}
              renderIcon={Receipt}
            >
              Sales
            </SideNavLink>
          )}
          {/* Cashier - Admin and Seller only (not Manager) */}
          {(userRole === 'ADMIN' || userRole === 'SELLER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/cashier')}
              renderIcon={UserRole}
            >
              Cashier
            </SideNavLink>
          )}
          {/* Removed Notifications sidebar link; header icon remains the entry point */}
          {false && (
            <SideNavLink
              onClick={() => navigate('/notifications')}
              renderIcon={Notification}
            >
              Notifications
            </SideNavLink>
          )}
        </SideNavItems>
      </SideNav>

      {/* Restore Backup Modal */}
      <Modal
        open={restoreModalOpen}
        modalHeading="Restore Database Backup"
        primaryButtonText={restoreLoading ? 'Restoring...' : existingData?.hasData ? 'Restore Disabled' : 'Confirm Restore'}
        secondaryButtonText="Cancel"
        onRequestClose={() => {
          setRestoreModalOpen(false);
          setSelectedFile(null);
          setRestoreError(null);
          setRestoreSuccess(null);
        }}
        onRequestSubmit={handleRestoreBackup}
        primaryButtonDisabled={restoreLoading || !selectedFile || existingData?.hasData || false}
        size="sm"
      >
        <div style={{ padding: '1rem 0' }}>
          <p className="text-sm" style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
            Restore your database from a backup file. This will replace all current data with the backup data.
          </p>

          {/* Warning if existing data detected */}
          {existingData?.hasData && (
            <InlineNotification
              kind="error"
              title="Restore Restricted"
              subtitle="Database already contains data. Restore is only allowed on empty databases to prevent accidental data loss."
              className="mb-4"
            />
          )}

          {restoreSuccess && (
            <InlineNotification
              kind="success"
              title="Success"
              subtitle={restoreSuccess}
              className="mb-4"
            />
          )}

          {restoreError && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={restoreError}
              className="mb-4"
            />
          )}

          <FileUploader
            labelTitle="Upload backup file"
            labelDescription="Only .dump files are accepted (max 1GB)"
            buttonLabel="Choose file"
            buttonKind="primary"
            filenameStatus="edit"
            accept={['.dump']}
            onChange={handleFileSelect}
            disabled={restoreLoading || existingData?.hasData || false}
          />

          {selectedFile && (
            <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--cds-layer-02)' }}>
              <p className="text-sm">
                <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Backup Success/Error Notification */}
      {(backupSuccess || backupError) && (
        <div
          style={{
            position: 'fixed',
            top: '4rem',
            right: '1rem',
            zIndex: 9999,
            maxWidth: '400px',
          }}
        >
          {backupSuccess && (
            <InlineNotification
              kind="success"
              title="Success"
              subtitle={backupSuccess}
              onClose={() => setBackupSuccess(null)}
            />
          )}
          {backupError && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={backupError}
              onClose={() => setBackupError(null)}
            />
          )}
        </div>
      )}

      {/* Upload Analytics Notification */}
      {uploadNotification && (
        <div
          style={{
            position: 'fixed',
            top: '4rem',
            right: '1rem',
            zIndex: 9999,
            maxWidth: '400px',
          }}
        >
          <InlineNotification
            kind={uploadNotification.kind}
            title={uploadNotification.kind === 'success' ? 'Success' : 'Error'}
            subtitle={uploadNotification.message}
            onClose={() => setUploadNotification(null)}
          />
        </div>
      )}
    </>
  );
};

// Main component that renders the dashboard layout
export default function DashboardLayout() {
  return <HeaderWithNotifications />;
}
