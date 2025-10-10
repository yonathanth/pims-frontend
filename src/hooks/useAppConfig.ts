import { useState, useEffect, useCallback } from 'react';
import {
  loadAppConfig,
  saveAppConfig,
  testApiConnection,
  type AppConfig,
} from '../config/app-config';
import { updateApiBaseUrl } from '../api/tauriClient';

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(loadAppConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Load config on mount
  useEffect(() => {
    setConfig(loadAppConfig());
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<AppConfig>) => {
    const updated = saveAppConfig(newConfig);
    setConfig(updated);

    // Update the API client if URL changed
    if (newConfig.apiBaseUrl) {
      updateApiBaseUrl(newConfig.apiBaseUrl);
    }
  }, []);

  // Test API connection
  const testConnection = useCallback(
    async (url?: string) => {
      const testUrl = url || config.apiBaseUrl;
      setTesting(true);
      setTestResult(null);

      try {
        const result = await testApiConnection(testUrl);
        setTestResult(result);
        return result;
      } finally {
        setTesting(false);
      }
    },
    [config.apiBaseUrl],
  );

  // Reset to defaults
  const resetConfig = useCallback(() => {
    const defaultConfig = loadAppConfig();
    setConfig(defaultConfig);
    updateApiBaseUrl(defaultConfig.apiBaseUrl);
  }, []);

  return {
    config,
    updateConfig,
    testConnection,
    resetConfig,
    testing,
    testResult,
  };
}









