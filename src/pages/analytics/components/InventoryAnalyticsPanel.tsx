import SummaryCards from './SummaryCards';
import { inventorySummaryData } from '../../../data/summaryData';
import { inventoryDonutData, inventoryOptions } from '../../../data/donutData';
import { DonutChart, GroupedBarChart } from "@carbon/charts-react";
import { inventoryBarData, inventoryBarOptions } from '../../../data/barData';
import {SortableTable} from "../../../components/SortableTable";
import { inventoryTableHeaders, exampleRows } from '../../../data/tabTableData';
import type { AnalyticsResponseDto, MonthlySeriesPointDto, CategorySliceDto } from '../../../api/analytics';

interface InventoryAnalyticsPanelProps {
  analytics?: AnalyticsResponseDto | null;
}

const InventoryAnalyticsPanel: React.FC<InventoryAnalyticsPanelProps> = ({ analytics }) => {
  // Summary cards (inventory specific)
  const summaryData = (analytics?.inventory_cards && analytics.inventory_cards.length > 0)
    ? analytics.inventory_cards.map(metric => ({
        label: metric.label,
        // if value is an object (e.g. incomplete breakdown) stringify it so it renders properly
        value: typeof metric.value === 'object' && metric.value !== null
          ? JSON.stringify(metric.value)
          : String(metric.value ?? ''),
        trend: metric.trend_up ? 'up' as const : 'down' as const
      }))
    : inventorySummaryData;

  // Donut data from distribution_by_category (fallback to static if empty)
  const donutData = (analytics?.distribution_by_category && analytics.distribution_by_category.length > 0)
    ? analytics.distribution_by_category.map((c: CategorySliceDto) => ({
        group: c.category,
        value: c.stock_qty
      }))
    : inventoryDonutData;

  // Bar chart data from monthly_stocked_vs_sold (fallback to static)
  const barData = (analytics?.monthly_stocked_vs_sold && analytics.monthly_stocked_vs_sold.length > 0)
    ? analytics.monthly_stocked_vs_sold.flatMap((m: MonthlySeriesPointDto) => ([
        { group: 'Stocked', key: m.month, value: m.stocked },
        { group: 'Sold', key: m.month, value: m.sold }
      ]))
    : inventoryBarData;

  return (
    <div>
      <div className='px-2'>
        <SummaryCards summaryData={summaryData} />
      </div>
      <div className="flex flex-col lg:flex-row  px-2">
        <div className="flex-1 rounded-md p-4">
          <DonutChart data={donutData} options={inventoryOptions} />
        </div>
        <div className="flex-1 rounded-md p-4">
          <GroupedBarChart data={barData} options={inventoryBarOptions} />
        </div>
      </div>

            {/* Out of Stock Products Table */}
            <div className=" rounded-md">
        <SortableTable
        filterOptions={[]}
          headers={inventoryTableHeaders}
          data={exampleRows}
          title="Out of Stock Products"
          searchField="drugName"
          
        />
      </div>

      {/* Expired Products Table */}
      <div className="rounded-md">
        <SortableTable
                filterOptions={[]}
          headers={inventoryTableHeaders}
          data={exampleRows}
          title="Expired Products"
          searchField="drugName"
        />
      </div>

      {/* Soon to be Expired Table */}
      <div className="rounded-md">
        <SortableTable
                filterOptions={[]}
          headers={inventoryTableHeaders}
          data={exampleRows}
          title="Soon to be Expired"
          searchField="drugName"
        />
      </div>

      {/* Soon to be Out of Stock Table */}
      <div className="rounded-md">
        <SortableTable
          headers={inventoryTableHeaders}
          data={exampleRows}
          filterOptions={[]}
          title="Soon to be Out of Stock"
          searchField="drugName"
        />
      </div>
    

    </div>
  )
}

export default InventoryAnalyticsPanel
