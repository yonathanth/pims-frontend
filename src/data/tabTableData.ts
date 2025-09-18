export const inventoryTableHeaders = [
    { key: "drugName", header: "Drug Name" },
    { key: "sku", header: "SKU" },
    { key: "batchNumber", header: "Batch Number" },
    { key: "expiryDate", header: "Expiry Date" },
    { key: "quantity", header: "Quantity" },
    { key: "location", header: "Location" },
    { key: "unitPrice", header: "Unit Price" },
    { key: "lastRestock", header: "Last Restock" },
    { key: "supplier", header: "Supplier" },
  ];
  
  // Example row data (repeat or adjust as needed)
export const exampleRows = [
    {
        id: "1",
        drugName: "Amoxicillin 500 mg",
        sku: "AMX-500",
        batchNumber: "A12345",
        expiryDate: "2025-12-15",
        quantity: 120,
        location: "Shelf A1",
        unitPrice: "Content",
        lastRestock: "2025-07-10",
        supplier: "PharmaCorp Inc."
      },
      {
        id: "2",
        drugName: "Penicillin 1mg",
        sku: "PEN-100",
        batchNumber: "B54321",
        expiryDate: "2025-10-10",
        quantity: 80,
        location: "Shelf B2",
        unitPrice: "Content",
        lastRestock: "2025-06-15",
        supplier: "Pharma Inc."
      },   
      {
        id: "3",

      drugName: "Amoxicillin 500 mg",
      sku: "AMX-500",
      batchNumber: "A12345",
      expiryDate: "2025-12-15",
      quantity: 120,
      location: "Shelf A1",
      unitPrice: "Content",
      lastRestock: "2025-07-10",
      supplier: "PharmaCorp Inc."
    }
  ];
  
  
  // Fast Moving Products
  export const fastMovingProductsRows = [
    {
      id: "1",
      drugName: "Amoxicillin 500 mg",
      sku: "AMX-500",
      batchNumber: "A12345",
      expiryDate: "2025-12-15",
      quantity: 120,
      location: "Shelf A1",
      unitPrice: "Content",
      lastRestock: "2025-07-10",
      supplier: "PharmaCorp Inc.",
      quantitySold: 2000,
    },
    {
      id: "2",
      drugName: "Penicillin 1mg",
      sku: "AMX-500",
      batchNumber: "A12345",
      expiryDate: "2025-12-15",
      quantity: 120,
      location: "Shelf A1",
      unitPrice: "Content",
      lastRestock: "2025-07-10",
      supplier: "PharmaCorp Inc.",
      quantitySold: 2000,
    },
    {
      id: "3",
      drugName: "Amoxicillin 500 mg",
      sku: "AMX-500",
      batchNumber: "A12345",
      expiryDate: "2025-12-15",
      quantity: 120,
      location: "Shelf A1",
      unitPrice: "Content",
      lastRestock: "2025-07-10",
      supplier: "PharmaCorp Inc.",
      quantitySold: 2000,
    }
  ];
  
  // Slow Moving Products
  export const slowMovingProductsRows = [
    {
      id: "1",
      drugName: "Amoxicillin 500 mg",
      sku: "AMX-500",
      batchNumber: "A12345",
      expiryDate: "2025-12-15",
      quantity: 120,
      location: "Shelf A1",
      unitPrice: "Content",
      lastRestock: "2025-07-10",
      supplier: "PharmaCorp Inc.",
      quantitySold: 200,
    },
    {
      id: "2",
      drugName: "Penicillin 1mg",
      sku: "AMX-500",
      batchNumber: "A12345",
      expiryDate: "2025-12-15",
      quantity: 120,
      location: "Shelf A1",
      unitPrice: "Content",
      lastRestock: "2025-07-10",
      supplier: "PharmaCorp Inc.",
      quantitySold: 200,
    },
    {
      id: "3",
      drugName: "Amoxicillin 500 mg",
      sku: "AMX-500",
      batchNumber: "A12345",
      expiryDate: "2025-12-15",
      quantity: 120,
      location: "Shelf A1",
      unitPrice: "Content",
      lastRestock: "2025-07-10",
      supplier: "PharmaCorp Inc.",
      quantitySold: 230,
    }
  ];

  // --- Top Suppliers Table ---

export const topSuppliersHeaders = [
  { key: "name", header: "Name" },
  { key: "volumeSupplied", header: "Volume supplied" },
  { key: "valueSupplied", header: "Value Supplied" },
  { key: "ordersDelivered", header: "Orders Delivered" },
  { key: "orderCompletion", header: "Order Completion" },
  { key: "mostSuppliedItem", header: "Most Supplied Item" },
];

export const topSuppliersRows = [
  {
    id: "1",
    name: "Shelf A1",
    volumeSupplied: "Shelf",
    valueSupplied: 500,
    ordersDelivered: 420,
    orderCompletion: "80%",
    mostSuppliedItem: "Panadol",
  },
  {
    id: "2",
    name: "Shelf A1",
    volumeSupplied: "Shelf",
    valueSupplied: 500,
    ordersDelivered: 420,
    orderCompletion: "80%",
    mostSuppliedItem: "Amoxicillin",
  },
  {
    id: "3",
    name: "Shelf A1",
    volumeSupplied: "Shelf",
    valueSupplied: 500,
    ordersDelivered: 420,
    orderCompletion: "80%",
    mostSuppliedItem: "Amoxicillin",
  },
  {
    id: "4",
    name: "Shelf A1",
    volumeSupplied: "Shelf",
    valueSupplied: 500,
    ordersDelivered: 420,
    orderCompletion: "80%",
    mostSuppliedItem: "Panadol",
  },
];

// --- Most Ordered Products Table ---

export const mostOrderedProductsHeaders = [
  { key: "name", header: "Name" },
  { key: "brand", header: "Brand" },
  { key: "strength", header: "Strength (mg)" },
  { key: "orders", header: "Orders" },
];

export const mostOrderedProductsRows = [
  {
    id: "1",
    name: "Panadol",
    brand: "Mercedes",
    strength: 300,
    orders: 500,
  },
  {
    id: "2",
    name: "Penicillin",
    brand: "German",
    strength: 300,
    orders: 600,
  },
  {
    id: "3",
    name: "Amoxicillin",
    brand: "Ethiopian",
    strength: 300,
    orders: 600,
  },
  {
    id: "4",
    name: "Amoxicillin",
    brand: "Mercedes",
    strength: 300,
    orders: 600,
  },
  {
    id: "5",
    name: "Amoxicillin",
    brand: "English",
    strength: 300,
    orders: 600,
  },
  {
    id: "6",
    name: "Amoxicillin",
    brand: "Geraman",
    strength: 300,
    orders: 600,
  },
];

export const employeeVolumeSoldHeaders = [
  { key: "name", header: "Name" },
  { key: "username", header: "Username" },
  { key: "role", header: "Role" },
  { key: "email", header: "Email" },
  { key: "volumeSold", header: "Volume Sold(number of items)" },
];

export const employeeVolumeSoldRows = [
  {
    id: "1",
    name: "Berchume Dube Belachew",
    username: "@berchume_dube",
    role: "Pharmacist",
    email: "berchumedube@gmail.com",
    volumeSold: 120,
  },
  {
    id: "2",
    name: "Berchume Dube Belachew",
    username: "@berchume_dube",
    role: "Pharmacist",
    email: "berchumedube@gmail.com",
    volumeSold: 120,
  },
  {
    id: "3",
    name: "Berchume Dube Belachew",
    username: "@berchume_dube",
    role: "Pharmacist",
    email: "berchumedube@gmail.com",
    volumeSold: 120,
  },
  {
    id: "4",
    name: "Berchume Dube Belachew",
    username: "@berchume_dube",
    role: "Pharmacist",
    email: "berchumedube@gmail.com",
    volumeSold: 120,
  },
  {
    id: "5",
    name: "Berchume Dube Belachew",
    username: "@berchume_dube",
    role: "Pharmacist",
    email: "berchumedube@gmail.com",
    volumeSold: 120,
  },
  {
    id: "6",
    name: "Berchume Dube Belachew",
    username: "@berchume_dube",
    role: "Pharmacist",
    email: "berchumedube@gmail.com",
    volumeSold: 120,
  },
 
];