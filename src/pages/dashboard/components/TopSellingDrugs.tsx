import { SimpleBarChart } from '@carbon/charts-react';
import { ScaleTypes } from '@carbon/charts';
import { topSellingDrugs } from '../../../data/barData';
import type { TopSellingDrug } from '../../../api/dashboard';
import ChartErrorBoundary from '../../../components/ChartErrorBoundary';

interface TopSellingDrugsProps {
  data?: TopSellingDrug[];
}

const TopSellingDrugs = ({ data }: TopSellingDrugsProps) => {
  // Transform backend data to chart format
  const chartData = data
    ? data.map((drug) => ({
        group: drug.name,
        value: drug.quantity,
      }))
    : topSellingDrugs.data;

  // Create dynamic color scale based on the data
  const colorScale: Record<string, string> = {};
  const colors = [
    '#4285f4',
    '#ea4335',
    '#fbbc04',
    '#34a853',
    '#9aa0a6',
    '#ff6d01',
  ];

  chartData.forEach((item, index) => {
    colorScale[item.group] = colors[index % colors.length];
  });

  const options = {
    title: 'Top 6 Selling Drugs',
    axes: {
      left: {
        mapsTo: 'value',
        title: 'Quantity Sold',
      },
      bottom: {
        mapsTo: 'group',
        scaleType: ScaleTypes.LABELS,
        title: 'Drug',
      },
    },
    height: '400px',
    legend: {
      alignment: 'center' as const,
    },
    color: {
      scale: colorScale,
    },
  };

  return (
    <div
      className="w-[78%] p-2 px-4"
      style={{ backgroundColor: 'var(--cds-layer)' }}
    >
      <ChartErrorBoundary>
        <SimpleBarChart data={chartData} options={options}></SimpleBarChart>
      </ChartErrorBoundary>
    </div>
  );
};

export default TopSellingDrugs;
