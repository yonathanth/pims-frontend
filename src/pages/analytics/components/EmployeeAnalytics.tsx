import { Dropdown } from "@carbon/react"
import {  SortableTable
} from "../../../components/SortableTable"
import { employeeVolumeSoldHeaders } from "../../../data/tabTableData"
import SummaryCards from "./SummaryCards"
import { employeeSummaryData } from "../../../data/summaryData"
import type { AnalyticsResponseDto } from "../../../api/analytics";
import { useMemo } from 'react';

interface EmployeeAnalyticsProps { analytics?: AnalyticsResponseDto | null; sortBy: 'volume'|'name'; onChangeSort: (v: 'volume'|'name') => void }
const EmployeeAnalytics: React.FC<EmployeeAnalyticsProps> = ({ analytics, sortBy, onChangeSort }) => {
  const summary = (analytics?.metrics && analytics.metrics.length > 0)
    ? analytics.metrics.slice(0,4).map(m => ({
        label: m.label,
        value: typeof m.value === 'object' && m.value !== null ? JSON.stringify(m.value) : String(m.value ?? ''),
        trend: m.trend_up ? 'up' as const : 'down' as const
      }))
    : employeeSummaryData;
  const performers = useMemo(() => {
    const rows = (analytics?.top_performers?.length)
      ? analytics.top_performers.map((p, idx) => ({
          id: String(idx + 1),
          name: p.name,
          username: p.username || p.name.toLowerCase().replace(/\s+/g,'_'),
          role: 'Pharmacist', // backend doesn't currently return role in this DTO
          email: p.email || `${p.name.split(' ')[0].toLowerCase()}@pims.local`,
          volumeSold: p.volume_sold
        }))
      : [];
    if (sortBy === 'volume') {
      return [...rows].sort((a, b) => Number(b.volumeSold) - Number(a.volumeSold));
    }
    return [...rows].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [analytics?.top_performers, sortBy]);
  return (
    <div>
        <div className='px-2'>
        <SummaryCards summaryData={summary} />
      </div>
      {/*Dropdown */}
      <div className="flex justify-start px-6 mt-4">
        <div className="w-1/6">
          <Dropdown
            id="employee-sort"
            invalidText="Invalid selection"
            itemToString={(item) => (item ? item.label : "")}
            items={[
              { label: 'Volume Sold', value: 'volume' },
              { label: 'Name', value: 'name' },
            ] as Array<{label: string; value: 'volume'|'name'}>}
            selectedItem={sortBy === 'volume' ? { label: 'Volume Sold', value: 'volume' } : { label: 'Name', value: 'name' }}
            label={sortBy === 'volume' ? 'Volume Sold' : 'Name'}
            titleText="Sort employees by"
            type="default"
            onChange={(e: any) => onChangeSort(e.selectedItem?.value ?? 'volume')}
          />
        </div>


      </div>
        {/* Employee Volume Sold Table */}
        <div className="rounded-md">
        <SortableTable
          filterOptions={[]}
          headers={employeeVolumeSoldHeaders}
          data={performers}
          title="Top Performers"
          searchField="name"
          />
          </div>
    </div>
  )
}

export default EmployeeAnalytics
