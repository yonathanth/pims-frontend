import { Dropdown } from '@carbon/react';
import {
  topSuppliersHeaders,
  mostOrderedProductsHeaders,
} from '../../../data/tabTableData';
import { SortableTable } from '../../../components/SortableTable';
import SummaryCards from './SummaryCards';
// Remove fallback mock summary; show empty when backend has none
import type { AnalyticsResponseDto, ProductDto } from '../../../api/analytics';
import { useMemo } from 'react';

interface SupplyAnalyticsProps {
  analytics?: AnalyticsResponseDto | null;
  sortBy: 'volume' | 'value' | 'frequency';
  onChangeSort: (v: 'volume' | 'value' | 'frequency') => void;
}
const SupplyAnalytics: React.FC<SupplyAnalyticsProps> = ({
  analytics,
  sortBy,
  onChangeSort,
}) => {
  const summary =
    analytics?.metrics && analytics.metrics.length > 0
      ? analytics.metrics.slice(0, 5).map((m) => ({
          label: m.label,
          value:
            typeof m.value === 'object' && m.value !== null
              ? JSON.stringify(m.value)
              : String(m.value ?? ''),
          trend: m.trend_up ? ('up' as const) : ('down' as const),
        }))
      : [];
  const suppliersTable = useMemo(() => {
    const rows = analytics?.top_suppliers?.length
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
    const key =
      sortBy === 'volume'
        ? 'volumeSupplied'
        : sortBy === 'value'
          ? 'valueSupplied'
          : 'ordersDelivered';
    return [...rows].sort((a, b) => Number(b[key]) - Number(a[key]));
  }, [analytics?.top_suppliers, sortBy]);
  return (
    <div>
      <div className="px-2">
        <SummaryCards summaryData={summary} />
      </div>
      {/*Dropdown */}
      <div className="flex justify-start px-6 mt-4">
        <div className="w-1/6">
          <Dropdown
            id="supplier-sort"
            invalidText="Invalid selection"
            itemToString={(item) => (item ? item.label : '')}
            items={
              [
                { label: 'Volume Supplied', value: 'volume' },
                { label: 'Value Supplied', value: 'value' },
                { label: 'Order Frequency', value: 'frequency' },
              ] as Array<{
                label: string;
                value: 'volume' | 'value' | 'frequency';
              }>
            }
            selectedItem={
              sortBy === 'volume'
                ? { label: 'Volume Supplied', value: 'volume' }
                : sortBy === 'value'
                  ? { label: 'Value Supplied', value: 'value' }
                  : { label: 'Order Frequency', value: 'frequency' }
            }
            label={
              sortBy === 'volume'
                ? 'Volume Supplied'
                : sortBy === 'value'
                  ? 'Value Supplied'
                  : 'Order Frequency'
            }
            titleText="Sort suppliers by"
            type="default"
            onChange={(e: any) =>
              onChangeSort(e.selectedItem?.value ?? 'volume')
            }
          />
        </div>
      </div>
      {/* Top suppliers */}
      <div className="rounded-md">
        <SortableTable
          filterOptions={[]}
          headers={topSuppliersHeaders}
          data={suppliersTable}
          title="Top Suppliers"
          searchField="name"
        />
      </div>
      {/* Most Ordered Products */}
      <div className="rounded-md ">
        <SortableTable
          filterOptions={[]}
          headers={mostOrderedProductsHeaders}
          data={
            analytics?.most_ordered_products &&
            analytics.most_ordered_products.length > 0
              ? analytics.most_ordered_products.map(
                  (p: ProductDto, idx: number) => ({
                    id: String(idx + 1),
                    tradeName: p.trade_name
                      ? `${p.generic_name} (${p.trade_name})`
                      : p.generic_name,
                    strength: p.sku ?? '',
                    orders: p.ordered_qty,
                  }),
                )
              : []
          }
          title="Most Ordered Products"
          searchField="tradeName"
        />
      </div>
    </div>
  );
};

export default SupplyAnalytics;
