export const inventoryDonutData = [
  { group: 'Antibiotics', value: 320 },
  { group: 'Pain Relief', value: 210 },
  { group: 'Antivirals', value: 150 },
  { group: 'Vitamins', value: 90 },
  { group: 'Antifungals', value: 60 },
  { group: 'Others', value: 40 },
];

export const inventoryOptions = {
  title: 'Inventory by Medicine Category',
  resizable: true,
  donut: {
    center: {
      label: 'Inventory',
    },
  },
  height: '400px',
};

export const salesDonutData = [
  { group: 'Antibiotics', value: 320 },
  { group: 'Pain Relief', value: 210 },
  { group: 'Antivirals', value: 150 },
  { group: 'Vitamins', value: 90 },
  { group: 'Antifungals', value: 60 },
  { group: 'Others', value: 40 },
];

export const salesOptions = {
  title: 'Sales by Medicine Category',
  resizable: true,
  donut: {
    center: {
      label: 'Sales',
    },
  },
  height: '400px',
};

// Export inventoryByCategory for InventoryByCategory component
export const inventoryByCategory = {
  data: inventoryDonutData,
  options: inventoryOptions,
};
