// HTTP client for REST API calls (Tauri app connecting to remote backend)
const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Get session from localStorage for authentication
    const session = localStorage.getItem('session');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.token) {
          headers['Authorization'] = `Bearer ${sessionData.token}`;
        }
      } catch (error) {
        console.warn('Invalid session data in localStorage');
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err: any = new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
        err.status = response.status;
        err.details = errorData;
        throw err;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

const httpClient = new HttpClient(API_BASE_URL);

// Legacy compatibility function for existing code
export async function call<T>(
  command: string,
  payload?: Record<string, unknown>,
): Promise<T> {
  // Map Tauri commands to REST API endpoints
  const commandMap: Record<
    string,
    { method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; endpoint: string }
  > = {
    // Auth endpoints
    login: { method: 'POST', endpoint: '/auth/login' },
    logout: { method: 'POST', endpoint: '/auth/logout' },

    // Product endpoints
    list_drugs: { method: 'GET', endpoint: '/drugs' },
    create_drug: { method: 'POST', endpoint: '/drugs' },
    update_drug: { method: 'PUT', endpoint: '/drugs' },
    delete_drug: { method: 'DELETE', endpoint: '/drugs' },
    list_categories: { method: 'GET', endpoint: '/categories' },
    create_category: { method: 'POST', endpoint: '/categories' },
    update_category: { method: 'PUT', endpoint: '/categories' },
    delete_category: { method: 'DELETE', endpoint: '/categories' },

    // Inventory endpoints
    list_batches: { method: 'GET', endpoint: '/batches' },
    create_batch: { method: 'POST', endpoint: '/batches' },
    update_batch: { method: 'PUT', endpoint: '/batches' },
    delete_batch: { method: 'DELETE', endpoint: '/batches' },
    list_transactions: { method: 'GET', endpoint: '/transactions' },
    create_transaction: { method: 'POST', endpoint: '/transactions' },
    delete_transaction: {
      method: 'DELETE',
      endpoint: '/transactions',
    },

    // Order endpoints
    list_purchase_orders: {
      method: 'GET',
      endpoint: '/purchase-orders',
    },
    create_purchase_order: {
      method: 'POST',
      endpoint: '/purchase-orders',
    },
    update_purchase_order: {
      method: 'PUT',
      endpoint: '/purchase-orders',
    },
    delete_purchase_order: {
      method: 'DELETE',
      endpoint: '/purchase-orders',
    },
    // Note: item routes are nested in backend; callers should use explicit endpoints

    // User endpoints
    list_users: { method: 'GET', endpoint: '/users' },
    create_user: { method: 'POST', endpoint: '/users' },
    update_user: { method: 'PUT', endpoint: '/users' },
    delete_user: { method: 'DELETE', endpoint: '/users' },

    // Notification endpoints
    list_notifications: { method: 'GET', endpoint: '/notifications' },
    create_notification: { method: 'POST', endpoint: '/notifications' },
    delete_notification: { method: 'DELETE', endpoint: '/notifications' },

    // Supplier endpoints
    list_suppliers: { method: 'GET', endpoint: '/suppliers' },
    create_supplier: { method: 'POST', endpoint: '/suppliers' },
    update_supplier: { method: 'PUT', endpoint: '/suppliers' },
    delete_supplier: { method: 'DELETE', endpoint: '/suppliers' },

    // Location endpoints
    list_locations: { method: 'GET', endpoint: '/locations' },
    create_location: { method: 'POST', endpoint: '/locations' },
    update_location: { method: 'PUT', endpoint: '/locations' },
    delete_location: { method: 'DELETE', endpoint: '/locations' },
    list_batches_in_location: { method: 'GET', endpoint: '/locations/batches' },
    locations_summary: { method: 'GET', endpoint: '/locations/summary' },

    // Analytics endpoints
    get_analytics: { method: 'GET', endpoint: '/analytics' },
    distribution_by_category: {
      method: 'GET',
      endpoint: '/analytics/distribution-by-category',
    },
    monthly_stocked_vs_sold: {
      method: 'GET',
      endpoint: '/analytics/monthly-stocked-vs-sold',
    },
    metrics_summary: { method: 'GET', endpoint: '/analytics/metrics-summary' },

    // Audit endpoints
    list_audit_logs: { method: 'GET', endpoint: '/audit-logs' },
    get_audit_log: { method: 'GET', endpoint: '/audit-logs' },
    create_audit_log: { method: 'POST', endpoint: '/audit-logs' },
    delete_audit_log: { method: 'DELETE', endpoint: '/audit-logs' },

    // General Config endpoints
    list_general_configs: { method: 'GET', endpoint: '/general-configs' },
    create_general_config: { method: 'POST', endpoint: '/general-configs' },
    update_general_config: { method: 'PUT', endpoint: '/general-configs' },
    delete_general_config: { method: 'DELETE', endpoint: '/general-configs' },

    // Reports endpoints
    generate_inventory_report: {
      method: 'GET',
      endpoint: '/reports/inventory',
    },
    generate_sales_report: { method: 'GET', endpoint: '/reports/sales' },
    generate_expiry_report: { method: 'GET', endpoint: '/reports/expiry' },
    generate_purchase_report: { method: 'GET', endpoint: '/reports/purchase' },
    preview_report: { method: 'GET', endpoint: '/reports/preview' },
    export_report: { method: 'GET', endpoint: '/reports/export' },
  };

  const mapping = commandMap[command];
  if (!mapping) {
    throw new Error(`Unknown command: ${command}`);
  }

  const { method, endpoint } = mapping;

  // Handle different HTTP methods
  switch (method) {
    case 'GET': {
      const params =
        payload && (payload as any).query ? (payload as any).query : payload;
      return httpClient.get<T>(endpoint, params as any);
    }
    case 'POST':
      return httpClient.post<T>(endpoint, payload);
    case 'PUT':
      return httpClient.put<T>(endpoint, payload);
    case 'PATCH':
      return httpClient.patch<T>(endpoint, payload);
    case 'DELETE':
      return httpClient.delete<T>(endpoint);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

export { httpClient };
