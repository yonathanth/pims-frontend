import { ScaleTypes } from '@carbon/charts';

export const inventoryBarData = [
  { group: 'Stocked', key: 'January', value: 520 },
  { group: 'Sold', key: 'January', value: 540 },
  { group: 'Stocked', key: 'February', value: 500 },
  { group: 'Sold', key: 'February', value: 820 },
  { group: 'Stocked', key: 'March', value: 230 },
  { group: 'Sold', key: 'March', value: 150 },
  { group: 'Stocked', key: 'April', value: 210 },
  { group: 'Sold', key: 'April', value: 570 },
  { group: 'Stocked', key: 'May', value: 870 },
  { group: 'Sold', key: 'May', value: 260 },
  { group: 'Stocked', key: 'June', value: 760 },
  { group: 'Sold', key: 'June', value: 460 },
  { group: 'Stocked', key: 'July', value: 60 },
  { group: 'Sold', key: 'July', value: 180 },
];

export const inventoryBarOptions = {
  title: 'Monthly Inventory',
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
    alignment: 'center',
  },
  color: {
    scale: {
      Stocked: '#f8bbd0', // light pink
      Sold: '#bbdefb', // light blue
    },
  },
};

export const salesBarData = [
  { group: 'Stocked', key: 'January', value: 520 },
  { group: 'Sold', key: 'January', value: 540 },
  { group: 'Stocked', key: 'February', value: 500 },
  { group: 'Sold', key: 'February', value: 820 },
  { group: 'Stocked', key: 'March', value: 230 },
  { group: 'Sold', key: 'March', value: 150 },
  { group: 'Stocked', key: 'April', value: 210 },
  { group: 'Sold', key: 'April', value: 570 },
  { group: 'Stocked', key: 'May', value: 870 },
  { group: 'Sold', key: 'May', value: 260 },
  { group: 'Stocked', key: 'June', value: 760 },
  { group: 'Sold', key: 'June', value: 460 },
  { group: 'Stocked', key: 'July', value: 60 },
  { group: 'Sold', key: 'July', value: 180 },
];

export const salesBarOptions = {
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
    alignment: 'center',
  },
  color: {
    scale: {
      Stocked: '#f8bbd0', // light pink
      Sold: '#bbdefb', // light blue
    },
  },
};

// Export salesTrend for SalesTrend component
export const salesTrend = {
  data: salesBarData,
  options: salesBarOptions,
};

// Sample data for top selling drugs
export const topSellingDrugsData = [
  { group: 'Panadol', value: 450 },
  { group: 'Aspirin', value: 320 },
  { group: 'Amoxicillin', value: 280 },
  { group: 'Ibuprofen', value: 220 },
  { group: 'Vitamins', value: 180 },
  { group: 'Antibiotics', value: 150 },
];

export const topSellingDrugsOptions = {
  title: 'Top Selling Drugs',
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
    alignment: 'center',
  },
  color: {
    scale: {
      Panadol: '#4285f4',
      Aspirin: '#ea4335',
      Amoxicillin: '#fbbc04',
      Ibuprofen: '#34a853',
      Vitamins: '#9aa0a6',
      Antibiotics: '#ff6d01',
    },
  },
};

// Export topSellingDrugs for TopSellingDrugs component
export const topSellingDrugs = {
  data: topSellingDrugsData,
  options: topSellingDrugsOptions,
};
