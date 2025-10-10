import { debugLogger } from '../utils/debugLogger';

export interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  version: string;
  lastUpdated: string;
}

// Default configuration
const defaultConfig: AppConfig = {
  apiBaseUrl: 'http://localhost:3000/api', // Default to localhost, users can change to LAN IP
  appName: 'PIMS',
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
};

// Configuration storage key
const CONFIG_STORAGE_KEY = 'pims-app-config';

// Load configuration from localStorage or return defaults
export const loadAppConfig = (): AppConfig => {
  try {
    const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      debugLogger.info('App config loaded from localStorage', parsed);
      return { ...defaultConfig, ...parsed };
    }
  } catch (error) {
    debugLogger.warn('Failed to load app config, using defaults', { error });
  }
  debugLogger.info('Using default app config', defaultConfig);
  return defaultConfig;
};

// Save configuration to localStorage
export const saveAppConfig = (config: Partial<AppConfig>): AppConfig => {
  const currentConfig = loadAppConfig();
  const newConfig = {
    ...currentConfig,
    ...config,
    lastUpdated: new Date().toISOString(),
  };

  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    return newConfig;
  } catch (error) {
    console.error('Failed to save app config:', error);
    return currentConfig;
  }
};

// Reset configuration to defaults
export const resetAppConfig = (): AppConfig => {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    return defaultConfig;
  } catch (error) {
    console.error('Failed to reset app config:', error);
    return defaultConfig;
  }
};

// Test API connection
export const testApiConnection = async (
  apiUrl: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${apiUrl}/auth/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return { success: true, message: 'Connection successful!' };
    } else {
      return {
        success: false,
        message: `Server responded with status: ${response.status}`,
      };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timeout - server may be unreachable',
      };
    }
    if (error.message?.includes('Failed to fetch')) {
      return {
        success: false,
        message:
          'Network error - check if server is running and URL is correct',
      };
    }
    return { success: false, message: `Connection failed: ${error.message}` };
  }
};
