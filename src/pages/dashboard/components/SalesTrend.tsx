import { LineChart } from '@carbon/charts-react';
import { ScaleTypes } from '@carbon/charts';
import { salesTrend } from '../../../data/barData';
import type { MonthlyData } from '../../../api/dashboard';
import ChartErrorBoundary from '../../../components/ChartErrorBoundary';

interface SalesTrendProps {
  data?: MonthlyData[];
}

const SalesTrend = ({ data }: SalesTrendProps) => {
  // Transform backend data to Carbon LineChart format (only Sales):
  // [{ group: 'Sales', key: 'YYYY-MM', value: number }]
  const chartData = data
    ? data.map((item) => ({
        group: 'Sales',
        key: item.month,
        value: item.sales,
      }))
    : salesTrend.data;

  const options = {
    title: 'Monthly Sales',
    axes: {
      left: {
        mapsTo: 'value',
        title: 'Quantity',
      },
      bottom: {
        mapsTo: 'key',
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
        Sales: '#f8bbd0', // light pink
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
