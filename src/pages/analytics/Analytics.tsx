import { Dropdown } from "@carbon/react";
import SummaryCards from "./components/SummaryCards.tsx";
import AnalyticsTabs from "./components/AnalyticsTabs.tsx";
import GeneralPageLayout from "../../components/GeneralPageLayout";
import { useAnalytics } from "../../hooks/useAnalytics";
const Analytics = () => {
  const { data: analytics } = useAnalytics();

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


      {/*Dropdown */}
      <div className="flex justify-end px-6 mt-4">
        <div className="w-1/6">
          <Dropdown
            id="default"
            invalidText="invalid selection"
            itemToString={(item) => (item ? item.text : "")}
            items={[
              { text: 'barabom' },
              { text: 'Option 1' },
            ]}
            label="All time"
            titleText=" "
            type="default"
            warnText="please notice the warning"
          />
        </div>
      </div>
      {/* Summary Cards */}
      <div className='px-6'>
        <SummaryCards summaryData={summaryData} />
      </div>

      <AnalyticsTabs />
    </GeneralPageLayout >
  )
}

export default Analytics

