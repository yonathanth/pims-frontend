import React, { useState } from 'react';
import {
  Button,
  TextArea,
  InlineNotification,
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@carbon/react';
import { Checkmark, Close } from '@carbon/icons-react';
import { type PendingSale } from '../../../api/sales';

interface PendingSaleCardProps {
  sale: PendingSale;
  onApprove: (id: number) => Promise<void>;
  onDecline: (id: number, reason: string) => Promise<void>;
}

export const PendingSaleCard: React.FC<PendingSaleCardProps> = React.memo(
  ({ sale, onApprove, onDecline }) => {
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [,] = useState('');
    const [declineReason, setDeclineReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApprove = async () => {
      setLoading(true);
      setError(null);
      try {
        await onApprove(sale.id);
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
      return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB',
      }).format(amount);
    };

    return (
      <div
        className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow min-h-32 max-h-40 overflow-hidden"
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

        <div className="flex h-full min-h-24">
          <div className="flex-1 pr-4 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">
                {sale.drugName}
              </h3>
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: 'var(--cds-support-warning)',
                }}
              />
            </div>

            <div
              className="grid grid-cols-2 gap-1 text-sm mb-2"
              style={{ color: 'var(--cds-text-secondary)' }}
            >
              <div className="truncate">
                <span className="font-medium">SKU:</span> {sale.sku}
              </div>
              <div className="truncate">
                <span className="font-medium">Qty:</span> {sale.quantity}
              </div>
              <div className="truncate">
                <span className="font-medium">Total:</span>{' '}
                <span className="font-bold">
                  {formatCurrency(sale.totalPrice)}
                </span>
              </div>
              <div className="truncate">
                <span className="font-medium">Stock:</span> {sale.currentStock}
              </div>
              <div className="truncate col-span-2">
                <span className="font-medium">Customer:</span>{' '}
                {sale.customerName}
              </div>
            </div>

            <div
              className="text-sm truncate"
              style={{ color: 'var(--cds-text-secondary)' }}
            >
              {formatDate(sale.createdAt)}
            </div>
          </div>

          <div className="w-36 flex flex-col gap-1 flex-shrink-0">
            <Button
              kind="primary"
              size="sm"
              renderIcon={Checkmark}
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 w-full text-xs"
            >
              {loading ? 'Processing...' : 'Approve'}
            </Button>
            <Button
              kind="danger"
              size="sm"
              renderIcon={Close}
              onClick={() => setShowDeclineModal(true)}
              disabled={loading}
              className="flex-1 w-full text-xs"
            >
              Decline
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
          <ModalHeader label="" title="Decline Sale" />
          <ModalBody>
            <div>
              <p className="mb-4">
                Decline the sale of <b>{sale.quantity}</b> units of{' '}
                <b>{sale.drugName}</b> to <b>{sale.customerName}</b>?
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
              {loading ? 'Declining...' : 'Decline Sale'}
            </Button>
          </ModalFooter>
        </ComposedModal>
      </div>
    );
  },
);

PendingSaleCard.displayName = 'PendingSaleCard';
