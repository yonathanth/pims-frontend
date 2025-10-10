import React from 'react';
import DashboardLayout from './dashboard/layouts/DashboardLayout';
import { PendingSalesStack } from './seller/components/PendingSalesStack';

const SellerPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen w-full">
        {/* Header */}
        <div className="pt-6 pb-2 px-6 text-sm mt-6 ml-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Sales Management</h1>
            <p
              className="text-gray-600"
              style={{ color: 'var(--cds-text-secondary)' }}
            >
              Review and approve pending sales, view transaction history
            </p>
          </div>
        </div>

        {/* Main Content - Full screen for pending sales */}
        <div className="px-6 ml-6 flex flex-col h-[calc(100vh-200px)] pb-8">
          <PendingSalesStack />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SellerPage;
