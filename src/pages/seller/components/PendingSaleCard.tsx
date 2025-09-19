import React, { useState } from 'react';
import { Button, TextArea, InlineNotification } from '@carbon/react';
import { Checkmark, Close } from '@carbon/icons-react';
import { type PendingSale } from '../../../api/sales';

interface PendingSaleCardProps {
  sale: PendingSale;
  onApprove: (id: number) => Promise<void>;
  onDecline: (id: number, reason: string) => Promise<void>;
}

export const PendingSaleCard: React.FC<PendingSaleCardProps> = ({
  sale,
  onApprove,
  onDecline,
}) => {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await onApprove(sale.id);
      setShowApproveModal(false);
      setApproveNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve sale');
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
      await onDecline(sale.id, declineReason);
      setShowDeclineModal(false);
      setDeclineReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline sale');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
          className="mb-4"
        />
      )}

      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{sale.drugName}</h3>
            <span
              className="px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: 'var(--cds-support-warning-inverse)',
                color: 'var(--cds-support-warning)',
              }}
            >
              Pending
            </span>
          </div>

          <div
            className="grid grid-cols-2 gap-4 text-sm mb-3"
            style={{ color: 'var(--cds-text-secondary)' }}
          >
            <div>
              <span className="font-medium">SKU:</span> {sale.sku}
            </div>
            <div>
              <span className="font-medium">Category:</span> {sale.category}
            </div>
            <div>
              <span className="font-medium">Quantity:</span> {sale.quantity}
            </div>
            <div>
              <span className="font-medium">Unit Price:</span>{' '}
              {formatCurrency(sale.unitPrice)}
            </div>
            <div>
              <span className="font-medium">Total Price:</span>{' '}
              {formatCurrency(sale.totalPrice)}
            </div>
            <div>
              <span className="font-medium">Customer:</span> {sale.customerName}
            </div>
            <div>
              <span className="font-medium">Batch:</span> {sale.batchNumber}
            </div>
            <div>
              <span className="font-medium">Stock:</span> {sale.currentStock}
            </div>
          </div>

          {sale.notes && (
            <div className="mb-3">
              <span className="font-medium text-sm">Notes:</span>
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--cds-text-secondary)' }}
              >
                {sale.notes}
              </p>
            </div>
          )}

          <div
            className="text-xs"
            style={{ color: 'var(--cds-text-secondary)' }}
          >
            Requested: {formatDate(sale.createdAt)}
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <Button
            kind="primary"
            size="sm"
            renderIcon={Checkmark}
            onClick={() => setShowApproveModal(true)}
            disabled={loading}
          >
            Approve
          </Button>
          <Button
            kind="danger"
            size="sm"
            renderIcon={Close}
            onClick={() => setShowDeclineModal(true)}
            disabled={loading}
          >
            Decline
          </Button>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Approve Sale</h3>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--cds-text-secondary)' }}
            >
              Approve the sale of {sale.quantity} units of {sale.drugName} to{' '}
              {sale.customerName}?
            </p>

            <div className="flex gap-2 justify-end">
              <Button
                kind="secondary"
                onClick={() => {
                  setShowApproveModal(false);
                  setApproveNotes('');
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button kind="primary" onClick={handleApprove} disabled={loading}>
                {loading ? 'Approving...' : 'Approve Sale'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Decline Sale</h3>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--cds-text-secondary)' }}
            >
              Decline the sale of {sale.quantity} units of {sale.drugName} to{' '}
              {sale.customerName}?
            </p>

            <TextArea
              labelText="Reason for Declining *"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Please provide a reason for declining this sale..."
              rows={3}
              className="mb-4"
              required
            />

            <div className="flex gap-2 justify-end">
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
                {loading ? 'Declining...' : 'Decline Sale'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
