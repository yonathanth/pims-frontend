import { Tabs, Tab, TabList, TabPanels, TabPanel, InlineLoading } from "@carbon/react";
import InventoryAnalyticsPanel from "./InventoryAnalyticsPanel";
import SalesAnalytics from "./SalesAnalytics";
import SupplyAnalytics from "./SupplyAnalytics";
import EmployeeAnalytics from "./EmployeeAnalytics";
import { useEffect, useState } from "react";
import { useAnalytics } from "../../../hooks/useAnalytics";

const AnalyticsTabs = () => {
  const [selectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasInteracted] = useState(false);
  const { data: analytics } = useAnalytics();

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
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <InlineLoading description="Loading..." />
              </div>
            ) : (
              <InventoryAnalyticsPanel analytics={analytics} />
            )}
          </TabPanel>
          <TabPanel>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <InlineLoading description="Loading..." />
              </div>
            ) : (
              <SalesAnalytics analytics={analytics} />
            )}
          </TabPanel>
          <TabPanel>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <InlineLoading description="Loading..." />
              </div>
            ) : (
              <SupplyAnalytics analytics={analytics} />
            )}
          </TabPanel>
          <TabPanel>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <InlineLoading description="Loading..." />
              </div>
            ) : (
              <EmployeeAnalytics analytics={analytics} />
            )}
          </TabPanel>
        </TabPanels>
              </div>
    </Tabs>
    </div>
  );
};

export default AnalyticsTabs;
