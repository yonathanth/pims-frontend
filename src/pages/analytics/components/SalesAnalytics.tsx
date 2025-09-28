import SummaryCards from "./SummaryCards";
import { DonutChart, GroupedBarChart } from "@carbon/charts-react";
import { salesOptions } from "../../../data/donutData";
import { salesBarOptions } from "../../../data/barData";
import { SortableTable } from "../../../components/SortableTable";
import { inventoryTableHeaders } from "../../../data/tabTableData";
import type { AnalyticsResponseDto, ProductDto } from "../../../api/analytics";
import { useMemo, useState } from 'react';

interface SalesAnalyticsProps { analytics?: AnalyticsResponseDto | null }
const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ analytics }) => {
  const [sortFastBy] = useState<'qty'|'price'>('qty');
  const [sortSlowBy] = useState<'qty'|'price'>('qty');
  
  // Sales-specific cards: Total Sales, Profit, Total Transactions, Average Sales Value, Most Sold Item, Total Revenue
  const salesCardLabels = [
    'Total Sales',
    'Total Profit', 
    'Average Sales Value',
    'Most Sold Item',
  ];

  // Map backend field names to display names
  const fieldMapping: Record<string, string[]> = {
    'Total Sales': ['Total Sales (qty)', 'Total Sales'],
    'Total Profit': ['Total Profit', 'Profit'],
    'Average Sales Value': ['Avg Sale Value (per unit)', 'Average Sales Value', 'Avg Sale Value'],
    'Most Sold Item': ['Top seller', 'Most Sold Item', 'Top Seller'],
  };

  const backendCards = analytics?.metrics || [];
  const inventoryCards = analytics?.inventory_cards || [];
  const allCards = [...backendCards, ...inventoryCards];

  const summary = salesCardLabels.map(label => {
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
  const monthly = (analytics?.monthly_stocked_vs_sold?.length)
    ? analytics.monthly_stocked_vs_sold.flatMap(m => ([
        { group: 'Stocked', key: m.month, value: m.stocked },
        { group: 'Sold', key: m.month, value: m.sold }
      ]))
    : [];
  const donut = (analytics?.distribution_by_category?.length)
    ? analytics.distribution_by_category.map(c => ({ group: c.category, value: c.sold_qty }))
    : [];
  const fastMovingBase = (analytics?.fast_moving_products && analytics.fast_moving_products.length > 0)
    ? analytics.fast_moving_products.map((p: ProductDto, idx: number) => ({
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
        quantitySold: p.ordered_qty,
      }))
    : [];
  const slowMovingBase = (analytics?.slow_moving_products && analytics.slow_moving_products.length > 0)
    ? analytics.slow_moving_products.map((p: ProductDto, idx: number) => ({
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


  )
}

export default SalesAnalytics
