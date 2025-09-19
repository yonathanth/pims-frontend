import React from 'react';
import DashboardLayout from './dashboard/layouts/DashboardLayout';
import { PendingSalesStack } from './seller/components/PendingSalesStack';
import { SalesTransactionTable } from './seller/components/SalesTransactionTable';

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

        {/* Main Content with new layout */}
        <div className="px-6 ml-6 flex flex-col h-[calc(100vh-200px)]">
          {/* Top Section - Pending Sales (40% of screen) */}
          <div className="mb-6" style={{ height: '40vh' }}>
            <PendingSalesStack />
          </div>

          {/* Bottom Section - Sales History (60% of screen) */}
          <div className="flex-1" style={{ minHeight: '60vh' }}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Sales History</h2>
              <p
                className="text-sm text-gray-600 mb-4"
                style={{ color: 'var(--cds-text-secondary)' }}
              >
                Complete history of all sales transactions
              </p>
            </div>
            <div className="h-full overflow-hidden">
              <SalesTransactionTable />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SellerPage;
