import SummaryCards from './SummaryCards';
import { inventoryOptions } from '../../../data/donutData';
import { DonutChart, GroupedBarChart } from "@carbon/charts-react";
import { inventoryBarOptions } from '../../../data/barData';
import {SortableTable} from "../../../components/SortableTable";
import { inventoryTableHeaders } from '../../../data/tabTableData';
import type { AnalyticsResponseDto, MonthlySeriesPointDto, CategorySliceDto, ProductDto } from '../../../api/analytics';

interface InventoryAnalyticsPanelProps {
  analytics?: AnalyticsResponseDto | null;
}

const InventoryAnalyticsPanel: React.FC<InventoryAnalyticsPanelProps> = ({ analytics }) => {
  // Summary cards (inventory specific) - filter for inventory-related cards only
  const inventoryCardLabels = [
    'Total Items',
    'Turnover Rate',
    'Total Stock Value',
    'Expired Items',
    'Expiring in 30 days',
    'Low Stock Items',
    'Out of Stock',
  ];

  // Map backend field names to display names for inventory
  const fieldMapping: Record<string, string[]> = {
    'Total Items': ['Total Items'],
    'Turnover Rate': ['Turnover Rate', 'Turn Over Rate'],
    'Total Stock Value': ['Total Stock Value'],
    'Expired Items': ['Expired Items'],
    'Expiring in 30 days': ['Expiring in 30 days', 'Expiring in a Month'],
    'Low Stock Items': ['Low Stock Items', 'Low Stock'],
    'Out of Stock': ['Out of Stock'],
  };

  // Build summaryData: always show all cards, use backend value if present, else placeholder
  const backendCards = analytics?.inventory_cards || [];
  const metricsCards = analytics?.metrics || [];
  const allCards = [...backendCards, ...metricsCards];

  const summaryData = inventoryCardLabels.map(label => {
    const possibleNames = fieldMapping[label] || [label];
    const found = allCards.find(card => 
      possibleNames.some(name => card.label.toLowerCase() === name.toLowerCase())
    );
    return {
      label,
      value: found ? (typeof found.value === 'object' && found.value !== null ? JSON.stringify(found.value) : String(found.value ?? '—')) : '—',
      trend: found ? (found.trend_up ? 'up' : 'down') : 'up',
    } as { label: string; value: string | number | Record<string, unknown> | null; trend: 'up' | 'down' };
  });

  // Donut data strictly from backend; empty array if none
  const donutData = (analytics?.distribution_by_category && analytics.distribution_by_category.length > 0)
    ? analytics.distribution_by_category.map((c: CategorySliceDto) => ({
        group: c.category,
        value: c.stock_qty
      }))
    : [];

  // Bar chart data strictly from backend; empty array if none
  const barData = (analytics?.monthly_stocked_vs_sold && analytics.monthly_stocked_vs_sold.length > 0)
    ? analytics.monthly_stocked_vs_sold.flatMap((m: MonthlySeriesPointDto) => ([
        { group: 'Stocked', key: m.month, value: m.stocked },
        { group: 'Sold', key: m.month, value: m.sold }
      ]))
    : [];

  return (
    <div>
      <div className='px-2'>
        {/* Only show the first 10 cards (2 rows if 5 per row) */}
        <SummaryCards summaryData={summaryData.slice(0, 10)} />
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
          data={(analytics?.out_of_stock_products && analytics.out_of_stock_products.length > 0)
            ? analytics.out_of_stock_products.map((p: ProductDto, idx: number) => ({
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
              }))
            : []}
          title="Out of Stock Products"
          searchField="drugName"
          
        />
      </div>

      {/* Expired Products Table */}
      <div className="rounded-md">
        <SortableTable
                filterOptions={[]}
          headers={inventoryTableHeaders}
          data={(analytics?.expired_products && analytics.expired_products.length > 0)
            ? analytics.expired_products.map((p: ProductDto, idx: number) => ({
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
              }))
            : []}
          title="Expired Products"
          searchField="drugName"
        />
      </div>

      {/* Soon to be Expired Table */}
      <div className="rounded-md">
        <SortableTable
                filterOptions={[]}
          headers={inventoryTableHeaders}
          data={(analytics?.soon_to_expire_products && analytics.soon_to_expire_products.length > 0)
            ? analytics.soon_to_expire_products.map((p: ProductDto, idx: number) => ({
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
              }))
            : []}
          title="Soon to be Expired"
          searchField="drugName"
        />
      </div>

      {/* Soon to be Out of Stock Table */}
      <div className="rounded-md">
        <SortableTable
          headers={inventoryTableHeaders}
          data={(analytics?.soon_to_be_out_of_stock_products && analytics.soon_to_be_out_of_stock_products.length > 0)
            ? analytics.soon_to_be_out_of_stock_products.map((p: ProductDto, idx: number) => ({
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
              }))
            : []}
          filterOptions={[]}
          title="Soon to be Out of Stock"
          searchField="drugName"
        />
      </div>
    

    </div>
  )
}

export default InventoryAnalyticsPanel
