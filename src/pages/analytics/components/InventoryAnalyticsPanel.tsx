import SummaryCards from './SummaryCards';
import { inventoryOptions } from '../../../data/donutData';
import { DonutChart, GroupedBarChart } from '@carbon/charts-react';
import { inventoryBarOptions } from '../../../data/barData';
import { SortableTable } from '../../../components/SortableTable';
import { inventoryTableHeaders } from '../../../data/tabTableData';
import type {
  AnalyticsResponseDto,
  MonthlySeriesPointDto,
  CategorySliceDto,
  ProductDto,
} from '../../../api/analytics';

interface InventoryAnalyticsPanelProps {
  analytics?: AnalyticsResponseDto | null;
}

const InventoryAnalyticsPanel: React.FC<InventoryAnalyticsPanelProps> = ({
  analytics,
}) => {
  // Summary cards (inventory specific)
  const summaryData =
    analytics?.inventory_cards && analytics.inventory_cards.length > 0
      ? analytics.inventory_cards.map((metric) => ({
          label: metric.label,
          value:
            typeof metric.value === 'object' && metric.value !== null
              ? JSON.stringify(metric.value)
              : String(metric.value ?? ''),
          trend: metric.trend_up ? ('up' as const) : ('down' as const),
        }))
      : [];

  // Donut data strictly from backend; empty array if none
  const donutData =
    analytics?.distribution_by_category &&
    analytics.distribution_by_category.length > 0
      ? analytics.distribution_by_category.map((c: CategorySliceDto) => ({
          group: c.category,
          value: c.stock_qty,
        }))
      : [];

  // Bar chart data strictly from backend; empty array if none
  const barData =
    analytics?.monthly_stocked_vs_sold &&
    analytics.monthly_stocked_vs_sold.length > 0
      ? analytics.monthly_stocked_vs_sold.flatMap(
          (m: MonthlySeriesPointDto) => [
            { group: 'Stocked', key: m.month, value: m.stocked },
            { group: 'Sold', key: m.month, value: m.sold },
          ],
        )
      : [];

  return (
    <div>
      <div className="px-2">
        <SummaryCards summaryData={summaryData} />
      </div>
      <div className="flex flex-col lg:flex-row  px-2">
        <div className="flex-1 rounded-md p-4">
          {donutData.length > 0 ? (
            <DonutChart data={donutData} options={inventoryOptions} />
          ) : (
            <div className="text-sm text-gray-500">No data</div>
          )}
        </div>
        <div className="flex-1 rounded-md p-4">
          {barData.length > 0 ? (
            <GroupedBarChart data={barData} options={inventoryBarOptions} />
          ) : (
            <div className="text-sm text-gray-500">No data</div>
          )}
        </div>
      </div>

      {/* Out of Stock Products Table */}
      <div className=" rounded-md">
        <SortableTable
          filterOptions={[]}
          headers={inventoryTableHeaders}
          data={
            analytics?.out_of_stock_products &&
            analytics.out_of_stock_products.length > 0
              ? analytics.out_of_stock_products.map(
                  (p: ProductDto, idx: number) => ({
                    id: String(idx + 1),
                    drugName: p.generic_name,
                    sku: p.sku ?? '',
                    batchNumber: p.batch_number ?? '',
                    expiryDate: p.expiry_date ?? '',
                    quantity: p.quantity,
                    location: p.location ?? '',
                    unitPrice: String(p.unit_price),
                    lastRestock: p.last_restock ?? '',
                    supplier: p.supplier ?? '',
                    // Table expects unitPrice as string in our demo rows
                  }),
                )
              : []
          }
          title="Out of Stock Products"
          searchField="drugName"
        />
      </div>

      {/* Expired Products Table */}
      <div className="rounded-md">
        <SortableTable
          filterOptions={[]}
          headers={inventoryTableHeaders}
          data={
            analytics?.expired_products && analytics.expired_products.length > 0
              ? analytics.expired_products.map(
                  (p: ProductDto, idx: number) => ({
                    id: String(idx + 1),
                    drugName: p.generic_name,
                    sku: p.sku ?? '',
                    batchNumber: p.batch_number ?? '',
                    expiryDate: p.expiry_date ?? '',
                    quantity: p.quantity,
                    location: p.location ?? '',
                    unitPrice: String(p.unit_price),
                    lastRestock: p.last_restock ?? '',
                    supplier: p.supplier ?? '',
                  }),
                )
              : []
          }
          title="Expired Products"
          searchField="drugName"
        />
      </div>

      {/* Soon to be Expired Table */}
      <div className="rounded-md">
        <SortableTable
          filterOptions={[]}
          headers={inventoryTableHeaders}
          data={
            analytics?.soon_to_expire_products &&
            analytics.soon_to_expire_products.length > 0
              ? analytics.soon_to_expire_products.map(
                  (p: ProductDto, idx: number) => ({
                    id: String(idx + 1),
                    drugName: p.generic_name,
                    sku: p.sku ?? '',
                    batchNumber: p.batch_number ?? '',
                    expiryDate: p.expiry_date ?? '',
                    quantity: p.quantity,
                    location: p.location ?? '',
                    unitPrice: String(p.unit_price),
                    lastRestock: p.last_restock ?? '',
                    supplier: p.supplier ?? '',
                  }),
                )
              : []
          }
          title="Soon to be Expired"
          searchField="drugName"
        />
      </div>

      {/* Soon to be Out of Stock Table */}
      <div className="rounded-md">
        <SortableTable
          headers={inventoryTableHeaders}
          data={
            analytics?.soon_to_be_out_of_stock_products &&
            analytics.soon_to_be_out_of_stock_products.length > 0
              ? analytics.soon_to_be_out_of_stock_products.map(
                  (p: ProductDto, idx: number) => ({
                    id: String(idx + 1),
                    drugName: p.generic_name,
                    sku: p.sku ?? '',
                    batchNumber: p.batch_number ?? '',
                    expiryDate: p.expiry_date ?? '',
                    quantity: p.quantity,
                    location: p.location ?? '',
                    unitPrice: String(p.unit_price),
                    lastRestock: p.last_restock ?? '',
                    supplier: p.supplier ?? '',
                  }),
                )
              : []
          }
          filterOptions={[]}
          title="Soon to be Out of Stock"
          searchField="drugName"
        />
      </div>
    </div>
  );
};

export default InventoryAnalyticsPanel;
