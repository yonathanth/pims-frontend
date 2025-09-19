import React from 'react';
import { Button, InlineNotification } from '@carbon/react';
import { Renew } from '@carbon/icons-react';
import { usePendingSales } from '../../../hooks/usePendingSales';
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
        <Button
          kind="secondary"
          size="sm"
          renderIcon={Renew}
          onClick={refreshPendingSales}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
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
