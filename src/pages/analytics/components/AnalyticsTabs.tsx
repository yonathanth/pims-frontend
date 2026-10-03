import { Tabs, Tab, TabList, TabPanels, TabPanel, InlineLoading } from "@carbon/react";
import InventoryAnalyticsPanel from "./InventoryAnalyticsPanel";
import SalesAnalytics from "./SalesAnalytics";
import SupplyAnalytics from "./SupplyAnalytics";
import { useEffect, useState } from "react";
import type { AnalyticsResponseDto } from "../../../api/analytics";

interface AnalyticsTabsProps {
  analytics?: AnalyticsResponseDto | null;
  loading?: boolean;
  topSuppliersSort: 'volume'|'value'|'frequency';
  onChangeTopSuppliersSort: (v: 'volume'|'value'|'frequency') => void;
}

const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({
  analytics,
  loading: loadingProp = false,
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
        <Tab>Supply</Tab>
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
        </TabPanels>
              </div>
    </Tabs>
    </div>
  );
};

export default AnalyticsTabs;
