import { PieChart } from '@carbon/charts-react';
import { inventoryByCategory } from '../../../data/donutData';
import type { InventoryDistribution } from '../../../api/dashboard';
import ChartErrorBoundary from '../../../components/ChartErrorBoundary';

interface InventoryByCategoryProps {
  data?: InventoryDistribution[];
}

const InventoryByCategory = ({ data }: InventoryByCategoryProps) => {
  // Transform backend data to chart format
  const chartData = data
    ? data.map((item) => ({
        group: item.category,
        value: item.percentage,
      }))
    : inventoryByCategory.data;

  // Create dynamic color scale based on the data
  const colorScale: Record<string, string> = {};
  const colors = [
    '#4285f4',
    '#ea4335',
    '#fbbc04',
    '#34a853',
    '#9aa0a6',
    '#ff6d01',
    '#ff9800',
    '#795548',
  ];

  chartData.forEach((item, index) => {
    colorScale[item.group] = colors[index % colors.length];
  });

  const options = {
    title: 'Inventory Distribution by Category',
    resizable: true,
    donut: {
      center: {
        label: 'Inventory',
      },
    },
    height: '400px',
    color: {
      scale: colorScale,
    },
  };

  return (
    <div
      className="w-[22%] p-2 px-4 "
      style={{ backgroundColor: 'var(--cds-layer)' }}
    >
      <ChartErrorBoundary>
        <PieChart data={chartData} options={options}></PieChart>
      </ChartErrorBoundary>
    </div>
  );
};

export default InventoryByCategory;
