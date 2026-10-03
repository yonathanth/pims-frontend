import {
  topSuppliersHeaders,
} from '../../../data/tabTableData';
import { SortableTable } from '../../../components/SortableTable';
import SummaryCards from './SummaryCards';
import type { AnalyticsResponseDto } from '../../../api/analytics';

interface SupplyAnalyticsProps {
  analytics?: AnalyticsResponseDto | null;
  sortBy?: 'volume' | 'value' | 'frequency';
  onChangeSort?: (v: 'volume' | 'value' | 'frequency') => void;
}
const SupplyAnalytics: React.FC<SupplyAnalyticsProps> = ({
  analytics,
}) => {
  // Use supply_cards instead of metrics
  const summary =
    analytics?.supply_cards && analytics.supply_cards.length > 0
      ? analytics.supply_cards.map((m) => ({
          label: m.label,
          value:
            typeof m.value === 'object' && m.value !== null
              ? JSON.stringify(m.value)
              : String(m.value ?? ''),
          trend: m.trend_up ? ('up' as const) : ('down' as const),
        }))
      : [];
  
  // Top 10 suppliers by volume (already sorted by backend)
  const suppliersTable = analytics?.top_suppliers?.length
    ? analytics.top_suppliers.map((s) => ({
        id: String(s.id),
        name: s.name,
        volumeSupplied: Number(s.volume_supplied),
        valueSupplied: Number(s.value_supplied),
        ordersDelivered: Number(s.orders_delivered),
        orderCompletion: `${s.order_completion_pct.toFixed(1)}%`,
        mostSuppliedItem: s.most_supplied_item,
      }))
    : [];

  return (
    <div>
      <div className="px-2">
        <SummaryCards summaryData={summary} />
      </div>
      {/* Top 10 suppliers by volume */}
      <div className="rounded-md px-2">
        <SortableTable
          filterOptions={[]}
          headers={topSuppliersHeaders}
          data={suppliersTable}
          title="Top 10 Suppliers by Volume"
          searchField="name"
        />
      </div>
    </div>
  );
};

export default SupplyAnalytics;
