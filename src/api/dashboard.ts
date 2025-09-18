import { httpClient } from './tauriClient';

export interface DashboardCard {
  label: string;
  value: string;
}

export interface TopSellingDrug {
  name: string;
  quantity: number;
}

export interface InventoryDistribution {
  category: string;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  sales: number;
  purchases: number;
}

export interface AuditLog {
  entityName: string;
  action: string;
  timestamp: string;
  changeSummary: string;
}

export interface DashboardData {
  cards: DashboardCard[];
  topSellingDrugs: TopSellingDrug[];
  inventoryDistribution: InventoryDistribution[];
  monthlyData: MonthlyData[];
  recentAuditLogs: AuditLog[];
}

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await httpClient.get<DashboardData>('/dashboard');
    return response;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
};
