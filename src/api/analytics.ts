import { call } from "./tauriClient";

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

export interface AnalyticsResponseDto {
  metrics: KeyMetricDto[];
  inventory_cards: KeyMetricDto[];
  distribution_by_category: CategorySliceDto[];
  monthly_stocked_vs_sold: MonthlySeriesPointDto[];
  top_suppliers: SupplierSummary[];
  top_performers: TopPerformerDto[];
}

export interface AnalyticsQuery {
  range_days?: number;
  low_stock_threshold?: number;
}

export const getAnalytics = (query: AnalyticsQuery = {}) =>
  call<AnalyticsResponseDto>("get_analytics", { query });

export const getDistributionByCategory = (query: AnalyticsQuery = {}) =>
  call<CategorySliceDto[]>("distribution_by_category", { query });

export const getMonthlyStockedVsSold = (query: AnalyticsQuery = {}) =>
  call<MonthlySeriesPointDto[]>("monthly_stocked_vs_sold", { query });

export const getMetricsSummary = (query: AnalyticsQuery = {}) =>
  call<[KeyMetricDto[], KeyMetricDto[]]>("metrics_summary", { query });
