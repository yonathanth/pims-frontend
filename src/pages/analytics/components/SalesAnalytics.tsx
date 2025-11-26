import SummaryCards from './SummaryCards';
// Removed fallback random data; show empty when backend has none
import { DonutChart, GroupedBarChart } from '@carbon/charts-react';
import { salesOptions } from '../../../data/donutData';
import { salesBarOptions } from '../../../data/barData';
import { SortableTable } from '../../../components/SortableTable';
import { inventoryTableHeaders } from '../../../data/tabTableData';
import type { AnalyticsResponseDto, ProductDto } from '../../../api/analytics';
import { useMemo, useState } from 'react';

interface SalesAnalyticsProps {
  analytics?: AnalyticsResponseDto | null;
}
const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ analytics }) => {
  const [sortFastBy] = useState<'qty' | 'price'>('qty');
  const [sortSlowBy] = useState<'qty' | 'price'>('qty');
  const summary =
    analytics?.metrics && analytics.metrics.length > 0
      ? analytics.metrics.map((m) => ({
          label: m.label,
          value:
            typeof m.value === 'object' && m.value !== null
              ? JSON.stringify(m.value)
              : String(m.value ?? ''),
          trend: m.trend_up ? ('up' as const) : ('down' as const),
        }))
      : [];
  const monthly = analytics?.monthly_stocked_vs_sold?.length
    ? analytics.monthly_stocked_vs_sold.flatMap((m) => [
        { group: 'Stocked', key: m.month, value: m.stocked },
        { group: 'Sold', key: m.month, value: m.sold },
      ])
    : [];
  const donut = analytics?.distribution_by_category?.length
    ? analytics.distribution_by_category.map((c) => ({
        group: c.category,
        value: c.sold_qty,
      }))
    : [];
  const fastMovingBase =
    analytics?.fast_moving_products && analytics.fast_moving_products.length > 0
      ? analytics.fast_moving_products.map((p: ProductDto, idx: number) => ({
          id: String(idx + 1),
          drugName: p.trade_name
            ? `${p.generic_name} (${p.trade_name})`
            : p.generic_name,
          sku: p.sku ?? '',
          batchNumber: p.batch_number ?? '',
          expiryDate: p.expiry_date ?? '',
          quantity: p.quantity,
          location: p.location ?? '',
          unitPrice: String(p.unit_price),
          lastRestock: p.last_restock ?? '',
          supplier: p.supplier ?? '',
          quantitySold: p.ordered_qty,
        }))
      : [];
  const slowMovingBase =
    analytics?.slow_moving_products && analytics.slow_moving_products.length > 0
      ? analytics.slow_moving_products.map((p: ProductDto, idx: number) => ({
          id: String(idx + 1),
          drugName: p.trade_name
            ? `${p.generic_name} (${p.trade_name})`
            : p.generic_name,
          sku: p.sku ?? '',
          batchNumber: p.batch_number ?? '',
          expiryDate: p.expiry_date ?? '',
          quantity: p.quantity,
          location: p.location ?? '',
          unitPrice: String(p.unit_price),
          lastRestock: p.last_restock ?? '',
          supplier: p.supplier ?? '',
          quantitySold: p.ordered_qty,
        }))
      : [];
  const fastMoving = useMemo(() => {
    const key = sortFastBy === 'qty' ? 'quantitySold' : 'unitPrice';
    return [...fastMovingBase].sort((a, b) => Number(b[key]) - Number(a[key]));
  }, [fastMovingBase, sortFastBy]);
  const slowMoving = useMemo(() => {
    const key = sortSlowBy === 'qty' ? 'quantitySold' : 'unitPrice';
    return [...slowMovingBase].sort((a, b) => Number(b[key]) - Number(a[key]));
  }, [slowMovingBase, sortSlowBy]);
  return (
    <div>
      <div className="px-2">
        <SummaryCards summaryData={summary} />
      </div>
      <div className="flex flex-col lg:flex-row  px-2">
        <div className="flex-1 rounded-md p-4">
          {donut.length > 0 ? (
            <DonutChart data={donut} options={salesOptions} />
          ) : (
            <div className="text-sm text-gray-500">No data</div>
          )}
        </div>
        <div className="flex-1 rounded-md p-4">
          {monthly.length > 0 ? (
            <GroupedBarChart data={monthly} options={salesBarOptions} />
          ) : (
            <div className="text-sm text-gray-500">No data</div>
          )}
        </div>
      </div>

      {/* fast moving Table */}
      <div className=" rounded-md p-4">
        {/* Local sort control */}
        {/* Minimal inline select to avoid adding extra components */}
        <SortableTable
          filterOptions={[]}
          headers={inventoryTableHeaders}
          data={fastMoving}
          title="Fast Moving Products"
          searchField="drugName"
        />
      </div>

      {/* Slow Moving Table */}
      <div className="rounded-md p-4">
        {/* Local sort control */}
        <SortableTable
          filterOptions={[]}
          headers={inventoryTableHeaders}
          data={slowMoving}
          title="Slow Moving Products"
          searchField="drugName"
        />
      </div>
    </div>
  );
};

export default SalesAnalytics;
