import { httpClient } from "./tauriClient";

export interface KeyMetricDto {
  label: string;
  value: any; // serde_json::Value can be any
  trend_up: boolean;
}

export interface CategorySliceDto {
  category: string;
  stock_qty: number;
  sold_qty: number;
}

export interface MonthlySeriesPointDto {
  month: string;
  stocked: number;
  sold: number;
}

export interface SupplierSummary {
  id: number;
  name: string;
  volume_supplied: number;
  value_supplied: number;
  orders_delivered: number;
  order_completion_pct: number;
  most_supplied_item: string;
}

// Align with backend TopPerformerDto (name, username, email, volume_sold)
export interface TopPerformerDto {
  name: string;
  username: string;
  email: string;
  volume_sold: number;
}

// Product shape returned in multiple lists
export interface ProductDto {
  generic_name: string;
  brand_name?: string;
  sku?: string;
  batch_number?: string;
  expiry_date?: string; // ISO date part YYYY-MM-DD
  quantity: number;
  location?: string | null;
  unit_price: number; // unit cost for stock items
  last_restock?: string;
  supplier?: string;
  ordered_qty: number; // context-specific
}

export interface AnalyticsResponseDto {
  metrics: KeyMetricDto[];
  inventory_cards: KeyMetricDto[];
  distribution_by_category: CategorySliceDto[];
  monthly_stocked_vs_sold: MonthlySeriesPointDto[];
  top_suppliers: SupplierSummary[];
  top_performers: TopPerformerDto[];
  out_of_stock_products?: ProductDto[];
  expired_products?: ProductDto[];
  soon_to_be_out_of_stock_products?: ProductDto[];
  soon_to_expire_products?: ProductDto[];
  fast_moving_products?: ProductDto[];
  slow_moving_products?: ProductDto[];
  most_ordered_products?: ProductDto[];
}

export interface AnalyticsQuery {
  // Align to backend DTO (ValidationPipe transform applies)
  timeFilter?: 'daily' | 'monthly' | 'yearly' | 'custom' | 'date';
  startIso?: string; // when timeFilter=custom
  endIso?: string;   // optional for custom
  dateIso?: string;  // when timeFilter=date
  rangeDays?: number; // reserved
  lowStockThreshold?: number; // if omitted, backend uses General Configs
  topPerformersSort?: 'volume' | 'name';
  topPerformersOrder?: 'asc' | 'desc';
  topSuppliersSort?: 'volume' | 'value' | 'frequency';
  topSuppliersOrder?: 'asc' | 'desc';
}

function mapKeyMetric(m: any): KeyMetricDto {
  return {
    label: m.label,
    value: m.value,
    trend_up: Boolean(m.trendUp ?? m.trend_up ?? false),
  };
}

function mapCategorySlice(c: any): CategorySliceDto {
  return {
    category: c.category,
    stock_qty: Number(c.stockQty ?? c.stock_qty ?? 0),
    sold_qty: Number(c.soldQty ?? c.sold_qty ?? 0),
  };
}

function mapMonthlySeriesPoint(m: any): MonthlySeriesPointDto {
  return {
    month: m.month,
    stocked: Number(m.stocked ?? 0),
    sold: Number(m.sold ?? 0),
  };
}

function mapSupplierSummary(s: any): SupplierSummary {
  return {
    id: Number(s.id),
    name: s.name,
    volume_supplied: Number(s.volumeSupplied ?? s.volume_supplied ?? 0),
    value_supplied: Number(s.valueSupplied ?? s.value_supplied ?? 0),
    orders_delivered: Number(s.ordersDelivered ?? s.orders_delivered ?? 0),
    order_completion_pct: Number(
      s.orderCompletionPct ?? s.order_completion_pct ?? 0,
    ),
    most_supplied_item: s.mostSuppliedItem ?? s.most_supplied_item ?? '',
  };
}

function mapTopPerformer(p: any): TopPerformerDto {
  return {
    name: p.name,
    username: p.username,
    email: p.email,
    volume_sold: Number(p.volumeSold ?? p.volume_sold ?? 0),
  };
}

function mapProduct(p: any): ProductDto {
  return {
    generic_name: p.genericName ?? p.generic_name,
    brand_name: p.brandName ?? p.brand_name,
    sku: p.sku,
    batch_number: p.batchNumber ?? p.batch_number,
    expiry_date: p.expiryDate ?? p.expiry_date,
    quantity: Number(p.quantity ?? 0),
    location: p.location,
    unit_price: Number(p.unitPrice ?? p.unit_price ?? 0),
    last_restock: p.lastRestock ?? p.last_restock,
    supplier: p.supplier,
    ordered_qty: Number(p.orderedQty ?? p.ordered_qty ?? 0),
  };
}

function mapAnalyticsResponse(raw: any): AnalyticsResponseDto {
  return {
    metrics: Array.isArray(raw?.metrics)
      ? raw.metrics.map(mapKeyMetric)
      : [],
    inventory_cards: Array.isArray(raw?.inventoryCards)
      ? raw.inventoryCards.map(mapKeyMetric)
      : [],
    distribution_by_category: Array.isArray(raw?.distributionByCategory)
      ? raw.distributionByCategory.map(mapCategorySlice)
      : [],
    monthly_stocked_vs_sold: Array.isArray(raw?.monthlyStockedVsSold)
      ? raw.monthlyStockedVsSold.map(mapMonthlySeriesPoint)
      : [],
    top_suppliers: Array.isArray(raw?.topSuppliers)
      ? raw.topSuppliers.map(mapSupplierSummary)
      : [],
    top_performers: Array.isArray(raw?.topPerformers)
      ? raw.topPerformers.map(mapTopPerformer)
      : [],
    out_of_stock_products: Array.isArray(raw?.outOfStockProducts)
      ? raw.outOfStockProducts.map(mapProduct)
      : [],
    expired_products: Array.isArray(raw?.expiredProducts)
      ? raw.expiredProducts.map(mapProduct)
      : [],
    soon_to_be_out_of_stock_products: Array.isArray(
      raw?.soonToBeOutOfStockProducts,
    )
      ? raw.soonToBeOutOfStockProducts.map(mapProduct)
      : [],
    soon_to_expire_products: Array.isArray(raw?.soonToExpireProducts)
      ? raw.soonToExpireProducts.map(mapProduct)
      : [],
    fast_moving_products: Array.isArray(raw?.fastMovingProducts)
      ? raw.fastMovingProducts.map(mapProduct)
      : [],
    slow_moving_products: Array.isArray(raw?.slowMovingProducts)
      ? raw.slowMovingProducts.map(mapProduct)
      : [],
    most_ordered_products: Array.isArray(raw?.mostOrderedProducts)
      ? raw.mostOrderedProducts.map(mapProduct)
      : [],
  };
}

export const getAnalytics = async (query: AnalyticsQuery = {}) => {
  const raw = await httpClient.get<any>("/analytics", query as any);
  return mapAnalyticsResponse(raw);
};

export const getDistributionByCategory = (query: AnalyticsQuery = {}) =>
  httpClient.get<CategorySliceDto[]>("/analytics/distribution-by-category", query as any);

export const getMonthlyStockedVsSold = (query: AnalyticsQuery = {}) =>
  httpClient.get<MonthlySeriesPointDto[]>("/analytics/monthly-stocked-vs-sold", query as any);

export const getMetricsSummary = (query: AnalyticsQuery = {}) =>
  httpClient.get<[KeyMetricDto[], KeyMetricDto[]]>("/analytics/metrics-summary", query as any);
