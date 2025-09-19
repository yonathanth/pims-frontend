import { Tabs, Tab, TabList, TabPanels, TabPanel, InlineLoading } from "@carbon/react";
import InventoryAnalyticsPanel from "./InventoryAnalyticsPanel";
import SalesAnalytics from "./SalesAnalytics";
import SupplyAnalytics from "./SupplyAnalytics";
import EmployeeAnalytics from "./EmployeeAnalytics";
import { useEffect, useState } from "react";
import type { AnalyticsResponseDto } from "../../../api/analytics";

interface AnalyticsTabsProps {
  analytics?: AnalyticsResponseDto | null;
  loading?: boolean;
  topPerformersSort: 'volume'|'name';
  onChangeTopPerformersSort: (v: 'volume'|'name') => void;
  topSuppliersSort: 'volume'|'value'|'frequency';
  onChangeTopSuppliersSort: (v: 'volume'|'value'|'frequency') => void;
}

const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({
  analytics,
  loading: loadingProp = false,
  topPerformersSort,
  onChangeTopPerformersSort,
  topSuppliersSort,
  onChangeTopSuppliersSort,
}) => {
  const [selectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasInteracted] = useState(false);

  useEffect(() => {
    if (hasInteracted) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedIndex, hasInteracted]);

  return (
    <div className="w-full">
      <Tabs >
      <TabList contained fullWidth className=" mt-4 px-6">
        <Tab>Inventory Analytics</Tab>
        <Tab>Sales Analytics</Tab>
        <Tab>Supplier Analytics</Tab>
        <Tab>Employee Analaytics</Tab>
      </TabList>

      <div className="" style={{padding: ""}}>
      <TabPanels>
          <TabPanel>
            {loading || loadingProp ? (
              <div className="flex justify-center items-center h-64">
                <InlineLoading description="Loading..." />
              </div>
            ) : (
              <InventoryAnalyticsPanel analytics={analytics} />
            )}
          </TabPanel>
          <TabPanel>
            {loading || loadingProp ? (
              <div className="flex justify-center items-center h-64">
                <InlineLoading description="Loading..." />
              </div>
            ) : (
              <SalesAnalytics analytics={analytics} />
            )}
          </TabPanel>
          <TabPanel>
            {loading || loadingProp ? (
              <div className="flex justify-center items-center h-64">
                <InlineLoading description="Loading..." />
              </div>
            ) : (
              <SupplyAnalytics
                analytics={analytics}
                sortBy={topSuppliersSort}
                onChangeSort={onChangeTopSuppliersSort}
              />
            )}
          </TabPanel>
          <TabPanel>
            {loading || loadingProp ? (
              <div className="flex justify-center items-center h-64">
                <InlineLoading description="Loading..." />
              </div>
            ) : (
              <EmployeeAnalytics
                analytics={analytics}
                sortBy={topPerformersSort}
                onChangeSort={onChangeTopPerformersSort}
              />
            )}
          </TabPanel>
        </TabPanels>
              </div>
    </Tabs>
    </div>
  );
};

export default AnalyticsTabs;
