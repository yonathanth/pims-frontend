import { useState } from 'react';
import { TextInput, Button, InlineNotification } from '@carbon/react';
import {
  Settings as SettingsIcon,
  Checkmark as CheckmarkIcon,
} from '@carbon/icons-react';
import { useAppConfig } from '../../hooks/useAppConfig';

export default function ServerConfigTab() {
  const [serverUrl, setServerUrl] = useState('');
  const [serverUrlError, setServerUrlError] = useState('');
  const { config, updateConfig, testConnection, testing, testResult } =
    useAppConfig();

  const handleTestConnection = async () => {
    if (!serverUrl.trim()) {
      setServerUrlError('Server URL is required');
      return;
    }

    // Basic URL validation
    try {
      new URL(serverUrl);
    } catch {
      setServerUrlError(
        'Please enter a valid URL (e.g., http://localhost:3000/api)',
      );
      return;
    }

    setServerUrlError('');

    // Test connection
    const result = await testConnection(serverUrl);
    if (result.success) {
      // Save the working URL
      updateConfig({ apiBaseUrl: serverUrl });
    }
  };

  const handleServerUrlChange = (value: string) => {
    setServerUrl(value);
    setServerUrlError('');
  };

  const handleSave = () => {
    if (testResult?.success) {
      updateConfig({ apiBaseUrl: serverUrl });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3
          className="text-2xl font-semibold mb-2"
          style={{ color: 'var(--cds-text-primary)' }}
        >
          Server Configuration
        </h3>
        <p className="text-sm" style={{ color: 'var(--cds-text-secondary)' }}>
          Configure the backend server URL for API connections. This allows you
          to connect to different servers without rebuilding the application.
        </p>
      </div>

      {/* Server URL Configuration */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--cds-layer-01)',
          borderColor: 'var(--cds-border-subtle)',
        }}
      >
        <div className="mb-4">
          <h4
            className="text-lg font-medium"
            style={{ color: 'var(--cds-text-primary)' }}
          >
            API Server Settings
          </h4>
        </div>
        <div>
          <div className="space-y-4">
            <div>
              <TextInput
                id="server-url"
                labelText="API Server URL"
                placeholder="http://localhost:3000/api"
                value={serverUrl}
                onChange={(e) => handleServerUrlChange(e.target.value)}
                invalid={!!serverUrlError}
                invalidText={serverUrlError}
                helperText="Enter the full URL including protocol and port (e.g., http://localhost:3000/api)"
                size="lg"
              />
            </div>

            <div className="flex gap-3">
              <Button
                kind="secondary"
                onClick={handleTestConnection}
                disabled={testing || !serverUrl.trim()}
                size="lg"
                renderIcon={SettingsIcon}
              >
                {testing ? 'Testing Connection...' : 'Test Connection'}
              </Button>

              {testResult?.success && (
                <Button
                  kind="primary"
                  onClick={handleSave}
                  size="lg"
                  renderIcon={CheckmarkIcon}
                >
                  Save Configuration
                </Button>
              )}
            </div>

            {/* Test Result Notification */}
            {testResult && (
              <InlineNotification
                kind={testResult.success ? 'success' : 'error'}
                title={
                  testResult.success
                    ? 'Connection Successful'
                    : 'Connection Failed'
                }
                subtitle={testResult.message}
                onCloseButtonClick={() => {}}
                hideCloseButton={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* Current Configuration */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--cds-layer-01)',
          borderColor: 'var(--cds-border-subtle)',
        }}
      >
        <div className="mb-4">
          <h4
            className="text-lg font-medium"
            style={{ color: 'var(--cds-text-primary)' }}
          >
            Current Configuration
          </h4>
        </div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span
                className="font-medium text-sm mb-1"
                style={{ color: 'var(--cds-text-secondary)' }}
              >
                API URL
              </span>
              <span
                className="font-mono text-sm break-all"
                style={{ color: 'var(--cds-text-primary)' }}
              >
                {config.apiBaseUrl}
              </span>
            </div>
            <div className="flex flex-col">
              <span
                className="font-medium text-sm mb-1"
                style={{ color: 'var(--cds-text-secondary)' }}
              >
                App Name
              </span>
              <span style={{ color: 'var(--cds-text-primary)' }}>
                {config.appName}
              </span>
            </div>
            <div className="flex flex-col">
              <span
                className="font-medium text-sm mb-1"
                style={{ color: 'var(--cds-text-secondary)' }}
              >
                Version
              </span>
              <span style={{ color: 'var(--cds-text-primary)' }}>
                {config.version}
              </span>
            </div>
            <div className="flex flex-col">
              <span
                className="font-medium text-sm mb-1"
                style={{ color: 'var(--cds-text-secondary)' }}
              >
                Last Updated
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--cds-text-primary)' }}
              >
                {new Date(config.lastUpdated).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
