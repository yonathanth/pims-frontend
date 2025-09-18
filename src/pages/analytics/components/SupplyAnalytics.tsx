import { Dropdown } from '@carbon/react';
import {
  topSuppliersHeaders,
  topSuppliersRows,
  mostOrderedProductsHeaders,
  mostOrderedProductsRows,
} from '../../../data/tabTableData';
import { SortableTable } from '../../../components/SortableTable';
import SummaryCards from './SummaryCards';
import { supplierSummaryData } from '../../../data/summaryData';
import type { AnalyticsResponseDto } from '../../../api/analytics';

interface SupplyAnalyticsProps {
  analytics?: AnalyticsResponseDto | null;
}
const SupplyAnalytics: React.FC<SupplyAnalyticsProps> = ({ analytics }) => {
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
      : supplierSummaryData;
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
    : topSuppliersRows.map((r) => ({
        ...r,
        volumeSupplied:
          typeof r.volumeSupplied === 'string'
            ? Number(r.volumeSupplied) || 0
            : r.volumeSupplied,
      }));
  return (
    <div>
      <div className="px-2">
        <SummaryCards summaryData={summary} />
      </div>
      {/*Dropdown */}
      <div className="flex justify-start px-6 mt-4">
        <div className="w-1/6">
          <Dropdown
            id="default"
            invalidText="invalid selection"
            itemToString={(item) => (item ? item.text : '')}
            items={[
              { text: 'Value Supplied' },
              { text: 'Order Frequency' },
              { text: 'Volume Supplied' },
            ]}
            label="Volume Supplied"
            titleText=" "
            type="default"
            warnText="please notice the warning"
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
          data={mostOrderedProductsRows}
          title="Most Ordered Products"
          searchField="name"
        />
      </div>
    </div>
  );
};

export default SupplyAnalytics;
