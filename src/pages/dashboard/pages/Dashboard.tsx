import DashboardLayout from '../layouts/DashboardLayout';
import StatTabs from '../components/StatTabs';
import SalesTrend from '../components/SalesTrend';
import TopSellingDrugs from '../components/TopSellingDrugs';
import QuickActions from '../components/QuickActions';
import InventoryByCategory from '../components/InventoryByCategory';
import RecentActivity from '../components/RecentActivity';
import { useDashboard } from '../../../hooks/useDashboard';
const Dashboard = () => {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading dashboard data...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-500">
              Error loading dashboard: {error}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Transform backend data to match frontend format
  const summaryData =
    data?.cards.map((card) => ({
      label: card.label,
      value: card.value,
      trend: 'up' as const, // Default trend since we removed arrows
    })) || [];

  return (
    <DashboardLayout>
      <div className="p-6 ">
        <div>
          <h1 className="text-2xl  font-bold mb-2">Dashboard</h1>
          <p className=" mb-6" style={{ color: 'var(--cds-text-secondary)' }}>
            Welcome back! Here's what's happening on your pharmacy.
          </p>
        </div>

        <StatTabs summaryData={summaryData} />
        <div className="mt-6 flex gap-[1.1rem]">
          <TopSellingDrugs data={data?.topSellingDrugs} />

          <InventoryByCategory data={data?.inventoryDistribution} />
        </div>
        <div className="flex gap-6 mt-4">
          <SalesTrend data={data?.monthlyData} />
        </div>
        <div className="flex gap-4 mt-8">
          <RecentActivity data={data?.recentAuditLogs} />
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
