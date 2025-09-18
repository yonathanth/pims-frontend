import React from 'react';

interface StatTabsProps {
  summaryData: {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down';
    icon?: string;
  }[];
}

const StatTabs: React.FC<StatTabsProps> = ({ summaryData }) => {
  return (
    <div
      className="py-3 grid gap-4"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, auto)',
      }}
    >
      {summaryData.map(({ label, value, change, trend, icon }, index) => (
        <div
          key={index}
          className="border p-4 flex flex-col gap-2"
          style={{ backgroundColor: 'var(--cds-layer)' }}
        >
          <div className="flex justify-between gap-2">
            <span className="text-sm">{label}</span>
          </div>
          <div className="flex items-center justify-between">
            <strong className="text-lg">{value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatTabs;
