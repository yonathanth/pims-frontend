import { Dropdown } from "@carbon/react"
import {  SortableTable
} from "../../../components/SortableTable"
import { employeeVolumeSoldHeaders } from "../../../data/tabTableData"
import SummaryCards from "./SummaryCards"
// import { employeeSummaryData } from "../../../data/summaryData" // removed unused import
import type { AnalyticsResponseDto } from "../../../api/analytics";
import { useMemo } from 'react';

interface EmployeeAnalyticsProps { analytics?: AnalyticsResponseDto | null; sortBy: 'volume'|'name'; onChangeSort: (v: 'volume'|'name') => void }
const EmployeeAnalytics: React.FC<EmployeeAnalyticsProps> = ({ analytics, sortBy, onChangeSort }) => {
  // Employee-specific cards: Total Staff, Sales Per Desk, Transaction Per Desk, Top Performer
  const employeeCardLabels = [
    'Total Staff',
    'Sales Per Staff',
    'Transaction Per Staff',
    'Top Performer',
  ];

  const backendCards = analytics?.metrics || [];
  // Map old backend field names to new card names for staff cards
  const fieldMapping: Record<string, string[]> = {
    'Total Staff': ['Total Staff'],
    'Sales Per Staff': ['Sales Per Staff', 'Sales Per Desk'],
    'Transaction Per Staff': ['Transaction Per Staff', 'Transaction Per Desk'],
    'Top Performer': ['Top Performer'],
  };
  const summary = employeeCardLabels.map(label => {
    const possibleNames = fieldMapping[label] || [label];
    const found = backendCards.find(card => possibleNames.some(name => card.label.toLowerCase() === name.toLowerCase()));
    return {
      label,
      value: found ? (typeof found.value === 'object' && found.value !== null ? JSON.stringify(found.value) : String(found.value ?? '—')) : '—',
      trend: found ? (found.trend_up ? 'up' : 'down') : 'up',
    } as { label: string; value: string | number | Record<string, unknown> | null; trend: 'up' | 'down' };
  });
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
