export interface OrderItem {
  id: string;
  orderId: string;
  orderDate: string;
  arrivalDate: string;
  items: number;
  status: string;
  supplier: string;
  products?: OrderProductItem[];
}

export interface OrderProductItem {
  product: string;
  status: string;
  quantity: number;
  quantityReceived: number;
}

export const orderData: OrderItem[] = [
  {
    id: "1",
    orderId: "0001",
    orderDate: "2025-12-15",
    arrivalDate: "2025-12-15",
    items: 120,
    status: "Complete",
    supplier: "PharmaCorp Inc.",
    products: [
      { product: "Amoxicillin 500mg", status: "Complete", quantity: 100, quantityReceived: 100 },
      { product: "Paracetamol 500mg", status: "Complete", quantity: 20, quantityReceived: 20 }
    ]
  },
  {
    id: "2",
    orderId: "0002",
    orderDate: "2025-12-15",
    arrivalDate: "2025-12-15",
    items: 130,
    status: "Pending",
    supplier: "Pharma Inc."
  },
  {
    id: "3",
    orderId: "0003",
    orderDate: "2025-12-15",
    arrivalDate: "2025-12-15",
    items: 140,
    status: "Partially Received",
    supplier: "PharmaCorp Inc."
  },
  {
    id: "4",
    orderId: "0004",
    orderDate: "2025-12-15",
    arrivalDate: "2025-12-15",
    items: 140,
    status: "Complete",
    supplier: "PharmaCorp Inc."
  },
  {
    id: "5",
    orderId: "0005",
    orderDate: "2025-12-15",
    arrivalDate: "2025-12-15",
    items: 140,
    status: "Cancelled",
    supplier: "PharmaCorp Inc."
  },
  {
    id: "6",
    orderId: "0006",
    orderDate: "2025-12-15",
    arrivalDate: "2025-12-15",
    items: 140,
    status: "Pending",
    supplier: "PharmaCorp Inc."
  }
];

export const orderHeaders = [
  { key: "orderId", header: "Order ID" },
  { key: "orderDate", header: "Order Date" },
  { key: "arrivalDate", header: "Arrival Date" },
  { key: "items", header: "Items" },
  { key: "status", header: "Status" },
  { key: "supplier", header: "Supplier" }
];

export const orderFilterOptions = [
  "All Statuses",
  "Complete",
  "Pending",
  "Partially Received",
  "Cancelled"
];

// Normalize various backend/frontend status strings to canonical labels used in filter options
const normalizeStatus = (s: string): string => {
  const raw = s.toLowerCase();
  if (raw.includes("cancel")) return "Cancelled";
  if (raw === "pending") return "Pending";
  if (raw.includes("partial")) return "Partially Received"; // covers "Partially Completed"
  if (raw.includes("complete")) return raw.startsWith("part") ? "Partially Received" : "Complete";
  return s; // fallback
};

export const orderCustomFilter = (item: OrderItem, filterValue: string) => {
  if (!filterValue || filterValue === "All Statuses") return true;
  const itemNorm = normalizeStatus(item.status);
  const filterNorm = normalizeStatus(filterValue);
  return itemNorm === filterNorm;
};
