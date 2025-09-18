import { Dropdown } from "@carbon/react"
import {  SortableTable
} from "../../../components/SortableTable"
import { employeeVolumeSoldHeaders, employeeVolumeSoldRows } from "../../../data/tabTableData"
import SummaryCards from "./SummaryCards"
import { employeeSummaryData } from "../../../data/summaryData"
import type { AnalyticsResponseDto } from "../../../api/analytics";

interface EmployeeAnalyticsProps { analytics?: AnalyticsResponseDto | null }
const EmployeeAnalytics: React.FC<EmployeeAnalyticsProps> = ({ analytics }) => {
  const summary = (analytics?.metrics && analytics.metrics.length > 0)
    ? analytics.metrics.slice(0,4).map(m => ({
        label: m.label,
        value: typeof m.value === 'object' && m.value !== null ? JSON.stringify(m.value) : String(m.value ?? ''),
        trend: m.trend_up ? 'up' as const : 'down' as const
      }))
    : employeeSummaryData;
  const performers = (analytics?.top_performers?.length)
    ? analytics.top_performers.map((p, idx) => ({
        id: String(idx + 1),
        name: p.name,
        username: p.username || p.name.toLowerCase().replace(/\s+/g,'_'),
        role: 'Pharmacist', // backend doesn't currently return role in this DTO
        email: p.email || `${p.name.split(' ')[0].toLowerCase()}@pims.local`,
        volumeSold: p.volume_sold
      }))
    : employeeVolumeSoldRows;
  return (
    <div>
        <div className='px-2'>
        <SummaryCards summaryData={summary} />
      </div>
      {/*Dropdown */}
      <div className="flex justify-start px-6 mt-4">
        <div className="w-1/6">
          <Dropdown
            id="default"
            invalidText="invalid selection"
            itemToString={(item) => (item ? item.text : "")}
            items={[
              { text: 'Value Soled' },
              { text: 'Order Soled' },
              { text: 'Volume Soled' },
            ]}
            label="Volume Sold"
            titleText=" "
            type="default"
            warnText="please notice the warning"
          />
        </div>


      </div>
        {/* Employee Volume Sold Table */}
        <div className="rounded-md">
        <SortableTable
          filterOptions={[]}
          headers={employeeVolumeSoldHeaders}
          data={performers}
          title="Employee Volume Sold"
          searchField="name"
          />
          </div>
    </div>
  )
}

export default EmployeeAnalytics
