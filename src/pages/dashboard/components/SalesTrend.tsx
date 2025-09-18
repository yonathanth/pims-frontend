import { LineChart } from '@carbon/charts-react';
import { ScaleTypes } from '@carbon/charts';
import { salesTrend } from '../../../data/barData';
import type { MonthlyData } from '../../../api/dashboard';
import ChartErrorBoundary from '../../../components/ChartErrorBoundary';

interface SalesTrendProps {
  data?: MonthlyData[];
}

const SalesTrend = ({ data }: SalesTrendProps) => {
  // Transform backend data to chart format
  const chartData = data
    ? data.map((item) => ({
        group: item.month,
        sales: item.sales,
        purchases: item.purchases,
      }))
    : salesTrend.data;

  const options = {
    title: 'Monthly Sales and Purchases',
    axes: {
      left: {
        mapsTo: 'value',
        title: 'Quantity',
      },
      bottom: {
        mapsTo: 'group',
        scaleType: ScaleTypes.LABELS,
        title: 'Month',
      },
    },
    height: '400px',
    legend: {
      alignment: 'center' as const,
    },
    color: {
      scale: {
        sales: '#f8bbd0', // light pink
        purchases: '#bbdefb', // light blue
      },
    },
  };

  return (
    <div
      className="w-full p-2 px-4 "
      style={{ backgroundColor: 'var(--cds-layer)' }}
    >
      <ChartErrorBoundary>
        <LineChart data={chartData} options={options}></LineChart>
      </ChartErrorBoundary>
    </div>
  );
};

export default SalesTrend;
