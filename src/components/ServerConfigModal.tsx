import { useState, useEffect } from 'react';
import { Modal, TextInput, Button, InlineNotification } from '@carbon/react';
import { Settings as SettingsIcon } from '@carbon/icons-react';
import { useAppConfig } from '../hooks/useAppConfig';

interface ServerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ServerConfigModal({
  isOpen,
  onClose,
}: ServerConfigModalProps) {
  const [serverUrl, setServerUrl] = useState('');
  const [serverUrlError, setServerUrlError] = useState('');
  const { config, updateConfig, testConnection, testing, testResult } =
    useAppConfig();

  // Initialize server URL from config when modal opens
  useEffect(() => {
    if (isOpen) {
      setServerUrl(config.apiBaseUrl);
      setServerUrlError('');
    }
  }, [isOpen, config.apiBaseUrl]);

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
      onClose();
    }
  };

  const handleCancel = () => {
    setServerUrl(config.apiBaseUrl);
    setServerUrlError('');
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onRequestClose={handleCancel}
      modalHeading="Server Configuration"
      modalLabel="API Settings"
      primaryButtonText="Save & Close"
      secondaryButtonText="Cancel"
      onRequestSubmit={handleSave}
      primaryButtonDisabled={!testResult?.success}
      size="sm"
    >
      <div className="space-y-6">
        {/* Server URL Input */}
        <div>
          <TextInput
            id="server-url"
            labelText="API Server URL"
            placeholder="http://localhost:3000/api"
            value={serverUrl}
            onChange={(e) => handleServerUrlChange(e.target.value)}
            invalid={!!serverUrlError}
            invalidText={serverUrlError}
            autoComplete="off"
            helperText="Enter the full URL including protocol and port"
            size="lg"
          />
        </div>

        {/* Test Connection Button */}
        <div className="flex justify-start">
          <Button
            kind="secondary"
            onClick={handleTestConnection}
            disabled={testing || !serverUrl.trim()}
            size="lg"
            renderIcon={SettingsIcon}
          >
            {testing ? 'Testing Connection...' : 'Test Connection'}
          </Button>
        </div>

        {/* Test Result Notification */}
        {testResult && (
          <InlineNotification
            kind={testResult.success ? 'success' : 'error'}
            title={
              testResult.success ? 'Connection Successful' : 'Connection Failed'
            }
            subtitle={testResult.message}
            onCloseButtonClick={() => {}}
            hideCloseButton={false}
          />
        )}

        {/* Current Configuration Display */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium mb-3 text-gray-900">
            Current Configuration
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span className="font-medium">API URL:</span>
              <span className="font-mono text-xs break-all">
                {config.apiBaseUrl}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">App Name:</span>
              <span>{config.appName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Version:</span>
              <span>{config.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Updated:</span>
              <span>{new Date(config.lastUpdated).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium mb-2 text-blue-900">Common URLs</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <div>
              • Local development:{' '}
              <code className="bg-blue-100 px-1 rounded">
                http://localhost:3000/api
              </code>
            </div>
            <div>
              • Production server:{' '}
              <code className="bg-blue-100 px-1 rounded">
                https://your-server.com/api
              </code>
            </div>
            <div>
              • Custom port:{' '}
              <code className="bg-blue-100 px-1 rounded">
                http://localhost:8080/api
              </code>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}









