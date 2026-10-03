import { InlineNotification } from '@carbon/react';
import type { ExpiryOrderConflict, ExpiryOrderPolicy } from '../api/sales';

interface ExpiryOrderNoticeProps {
  policy: ExpiryOrderPolicy;
  conflicts: ExpiryOrderConflict[];
}

const batchLabel = (b: { batchNumber: string | null; batchId: number }) =>
  `#${b.batchNumber || b.batchId}`;

// Shown when a sale takes stock from a batch while the same product has
// batches that expire sooner (see the "Sales Rules" setting)
export function ExpiryOrderNotice({ policy, conflicts }: ExpiryOrderNoticeProps) {
  if (conflicts.length === 0) return null;
  const blocked = policy === 'block';

  return (
    <InlineNotification
      kind={blocked ? 'error' : 'warning'}
      title={
        blocked
          ? 'Sell the batches that expire sooner first'
          : 'Batches that expire sooner are available'
      }
      hideCloseButton
      lowContrast
      className="mb-4"
    >
      <div>
        <ul className="list-disc pl-5 mt-1">
          {conflicts.map((c) => (
            <li key={c.batchId}>
              {c.drugName}, batch {batchLabel(c)} (expires{' '}
              {c.expiryDate.slice(0, 10)}): sooner{' '}
              {c.soonerBatches
                .map(
                  (b) =>
                    `${batchLabel(b)} (expires ${b.expiryDate.slice(0, 10)}, ${b.availableQty} left)`,
                )
                .join(', ')}
            </li>
          ))}
        </ul>
        <p className="mt-2">
          {blocked
            ? 'An administrator requires selling from the soonest-expiring batch. Use the batches listed instead.'
            : 'Consider selling from the batches listed instead, or choose "Sell anyway".'}
        </p>
      </div>
    </InlineNotification>
  );
}

export default ExpiryOrderNotice;
