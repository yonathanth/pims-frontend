import { Dropdown, DatePicker, DatePickerInput, NumberInput } from "@carbon/react";
import SummaryCards from "./components/SummaryCards.tsx";
import AnalyticsTabs from "./components/AnalyticsTabs.tsx";
import GeneralPageLayout from "../../components/GeneralPageLayout";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useMemo, useState } from "react";
import type { AnalyticsQuery } from "../../api/analytics";
const Analytics = () => {
  // local filter state
  const [timeFilter, setTimeFilter] = useState<"daily" | "monthly" | "yearly" | "custom" | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [topPerformersSort, setTopPerformersSort] = useState<'volume'|'name'>('volume');
  const [topSuppliersSort, setTopSuppliersSort] = useState<'volume'|'value'|'frequency'>('volume');

  const query: AnalyticsQuery = useMemo(() => {
    const q: AnalyticsQuery = {};
    if (timeFilter) q.timeFilter = timeFilter;
    if (timeFilter === 'custom') {
      const [start, end] = dateRange;
      if (start) q.startIso = start.toISOString();
      if (end) q.endIso = end.toISOString();
    }
    q.lowStockThreshold = lowStockThreshold;
    q.topPerformersSort = topPerformersSort;
    q.topSuppliersSort = topSuppliersSort;
    return q;
  }, [timeFilter, dateRange, lowStockThreshold, topPerformersSort, topSuppliersSort]);

  const { data: analytics, loading } = useAnalytics(query);

  // Transform backend metrics to match existing UI format
  const summaryData = analytics?.metrics?.map(metric => ({
    label: metric.label,
    value: String(metric.value),
    trend: metric.trend_up ? "up" as const : "down" as const
  })) || [];

  return (
    <GeneralPageLayout
      breadcrumbItems={[
        { label: "PIMS", href: "/" },
        { label: "Analytics", isCurrentPage: true }
      ]}
      showExportButton={false}
    >
      <div>
        <h1 className="text-2xl px-6 font-semibold">Analytics</h1>
        <p className="text-sm text-gray-600 px-6">
          Track sales, inventory, and other key insights
        </p>
      </div>


      {/* Filters */}
      <div className="flex flex-col gap-4 px-6 mt-4 md:flex-row md:items-end">
        <div className="w-full md:w-1/4">
          <Dropdown
            id="analytics-time-filter"
            invalidText="Invalid selection"
            itemToString={(item) => (item ? item.label : "")}
            items={[
              { label: 'All time', value: undefined },
              { label: 'Daily', value: 'daily' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Yearly', value: 'yearly' },
              { label: 'Custom range', value: 'custom' },
            ] as Array<{label: string; value: any}>}
            selectedItem={timeFilter ? { label: timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1), value: timeFilter } : { label: 'All time', value: undefined }}
            label={timeFilter ? timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1) : 'All time'}
            titleText="Time range"
            type="default"
            onChange={(e: any) => setTimeFilter(e.selectedItem?.value)}
          />
        </div>
        {timeFilter === 'custom' && (
          <div className="w-full md:w-auto">
            <DatePicker datePickerType="range" onChange={(dates: any) => {
              // Carbon emits array of Date
              if (Array.isArray(dates) && dates.length === 2) {
                setDateRange([dates[0], dates[1]]);
              }
            }}>
              <DatePickerInput id="analytics-start" labelText="Start date" placeholder="mm/dd/yyyy" />
              <DatePickerInput id="analytics-end" labelText="End date" placeholder="mm/dd/yyyy" />
            </DatePicker>
          </div>
        )}
        <div className="w-full md:w-1/4">
          <NumberInput
            id="low-stock-threshold"
            label="Low stock threshold"
            min={0}
            value={lowStockThreshold}
            onChange={(e: any) => {
              const v = Number(e.imaginaryTarget?.value ?? e.target?.value);
              setLowStockThreshold(Number.isNaN(v) ? 0 : v);
            }}
          />
        </div>
      </div>
      {/* Summary Cards */}
      <div className='px-6'>
        <SummaryCards summaryData={summaryData} />
      </div>

      <AnalyticsTabs
        analytics={analytics}
        loading={loading}
        topPerformersSort={topPerformersSort}
        onChangeTopPerformersSort={setTopPerformersSort}
        topSuppliersSort={topSuppliersSort}
        onChangeTopSuppliersSort={setTopSuppliersSort}
      />
    </GeneralPageLayout >
  )
}

export default Analytics

