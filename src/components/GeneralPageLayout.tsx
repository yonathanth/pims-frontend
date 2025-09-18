import { useState, useEffect, type ReactNode } from 'react';
import DashboardLayout from '../pages/dashboard/layouts/DashboardLayout';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  InlineNotification,
} from '@carbon/react';
import { Export } from '@carbon/icons-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

export interface GeneralPageLayoutProps {
  breadcrumbItems: BreadcrumbItem[];
  title?: string;
  showExportButton?: boolean;
  onExportClick?: () => void;
  showSuccessNotification?: boolean;
  successMessage?: string;
  onCloseNotification?: () => void;
  additionalActions?: ReactNode;
  children: ReactNode;
}

const GeneralPageLayout = ({
  breadcrumbItems,
  title,
  showExportButton = true,
  onExportClick,
  showSuccessNotification = false,
  successMessage = 'Transaction has been made successfully',
  onCloseNotification,
  additionalActions,
  children,
}: GeneralPageLayoutProps) => {
  const [showNotification, setShowNotification] = useState(
    showSuccessNotification,
  );

  // keep internal state in sync with prop so notifications show after actions
  // when parent toggles showSuccessNotification
  useEffect(() => {
    setShowNotification(showSuccessNotification);
  }, [showSuccessNotification]);

  // auto-hide the success notification after a short delay if not dismissed
  useEffect(() => {
    if (!showNotification) return;
    const timer = setTimeout(() => {
      handleCloseNotification();
    }, 4000); // 4 seconds
    return () => clearTimeout(timer);
  }, [showNotification]);

  const handleCloseNotification = () => {
    setShowNotification(false);
    onCloseNotification?.();
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen w-full">
        {/* Breadcrumb */}
        <div className="pt-6 pb-2 px-6 text-sm mt-6 ml-6">
          <Breadcrumb>
            {breadcrumbItems.map((item, index) => (
              <BreadcrumbItem
                key={index}
                href={item.href}
                isCurrentPage={item.isCurrentPage}
              >
                {item.label}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        </div>

        {/* Success Notification */}
        {showNotification && (
          <div className="mx-6 mb-4">
            <InlineNotification
              kind="success"
              title="Success"
              subtitle={successMessage}
              hideCloseButton={false}
              onCloseButtonClick={handleCloseNotification}
            />
          </div>
        )}

        {/* Top Section with Title and Export Button */}
        <div className="flex justify-between items-center px-6 mb-4 m-6">
          <div>
            {title && <h1 className="text-xl font-semibold">{title}</h1>}
          </div>
          <div className="flex items-center gap-4">
            {additionalActions}
            {showExportButton && (
              <Button
                kind="primary"
                size="md"
                renderIcon={Export}
                onClick={onExportClick}
              >
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Main Content with Add Button passed to SortableTable */}
        <div className="px-6">{children}</div>
      </div>
    </DashboardLayout>
  );
};

export default GeneralPageLayout;
