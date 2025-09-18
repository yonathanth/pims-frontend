import SummaryCards from "./SummaryCards";
import { salesSummaryData } from "../../../data/summaryData";
import { DonutChart, GroupedBarChart } from "@carbon/charts-react";
import { salesDonutData, salesOptions } from "../../../data/donutData";
import { salesBarData, salesBarOptions } from "../../../data/barData";
import { SortableTable } from "../../../components/SortableTable";
import { inventoryTableHeaders, fastMovingProductsRows, slowMovingProductsRows } from "../../../data/tabTableData";
import type { AnalyticsResponseDto } from "../../../api/analytics";

interface SalesAnalyticsProps { analytics?: AnalyticsResponseDto | null }
const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ analytics }) => {
  const summary = (analytics?.metrics && analytics.metrics.length > 0)
    ? analytics.metrics.map(m => ({
        label: m.label,
        value: typeof m.value === 'object' && m.value !== null ? JSON.stringify(m.value) : String(m.value ?? ''),
        trend: m.trend_up ? 'up' as const : 'down' as const
      }))
    : salesSummaryData;
  const monthly = (analytics?.monthly_stocked_vs_sold?.length)
    ? analytics.monthly_stocked_vs_sold.flatMap(m => ([
        { group: 'Stocked', key: m.month, value: m.stocked },
        { group: 'Sold', key: m.month, value: m.sold }
      ]))
    : salesBarData;
  const donut = (analytics?.distribution_by_category?.length)
    ? analytics.distribution_by_category.map(c => ({ group: c.category, value: c.sold_qty }))
    : salesDonutData;
  return (
    <div>
        <div className="px-2">
      <SummaryCards summaryData={summary} />
      </div>
            <div className="flex flex-col lg:flex-row  px-2">
              <div className="flex-1 rounded-md p-4">
                <DonutChart data={donut} options={salesOptions} />
              </div>
              <div className="flex-1 rounded-md p-4">
                <GroupedBarChart data={monthly} options={salesBarOptions} />
              </div>
            </div>

             {/* fast moving Table */}
                        <div className=" rounded-md p-4">
                    <SortableTable
                    filterOptions={[]}
                      headers={inventoryTableHeaders}
                      data={fastMovingProductsRows}
                      title="Fast Moving Products"
                      searchField="drugName"
                      
                    />
                  </div>
            
                  {/* Slow Moving Table */}
                  <div className="rounded-md p-4">
                    <SortableTable
                            filterOptions={[]}
                      headers={inventoryTableHeaders}
                      data={slowMovingProductsRows}
                      title="Slow Moving Products"
                      searchField="drugName"
                    />
                  </div>
      
    </div>


  )
}

export default SalesAnalytics
