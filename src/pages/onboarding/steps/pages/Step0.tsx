import { useState, useEffect } from 'react';
import StepLayout from '../layouts/StepLayout';
import { TextInput, Button, InlineNotification } from '@carbon/react';
import { useAppConfig } from '../../../../hooks/useAppConfig';

export default function Step0() {
  const [serverUrl, setServerUrl] = useState('');
  const [serverUrlError, setServerUrlError] = useState('');
  const { config, updateConfig, testConnection, testing, testResult } =
    useAppConfig();

  // Initialize server URL from config
  useEffect(() => {
    setServerUrl(config.apiBaseUrl);
  }, [config.apiBaseUrl]);

  // Store form data in localStorage for StepLayout to access
  const persistForm = (overrides: Partial<Record<string, any>> = {}) => {
    const formData = {
      serverUrl,
      ...overrides,
    };
    localStorage.setItem('onboarding_step0', JSON.stringify(formData));
  };

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
      persistForm({ serverUrl });
    }
  };

  // handleNext is handled by StepLayout based on canProceed prop

  return (
    <StepLayout currentStep={0} canProceed={testResult?.success === true}>
      <div className="flex flex-col mt-6 px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-7xl mx-auto">
          {/* Form Section */}
          <div className="md:col-span-3">
            <h2 className="text-4xl font-extralight mb-3">
              API Server Configuration
            </h2>
            <p className="mb-8 text-xl font-extralight">
              First, let's configure the backend server URL for API connections
            </p>

            {serverUrlError && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={serverUrlError}
                onCloseButtonClick={() => setServerUrlError('')}
                className="mb-6"
              />
            )}

            {/* Server URL Input */}
            <div className="mb-6">
              <TextInput
                id="server-url"
                labelText="API Server URL"
                placeholder="http://localhost:3000/api"
                value={serverUrl}
                onChange={(e) => {
                  const v = e.target.value;
                  setServerUrl(v);
                  persistForm({ serverUrl: v });
                  setServerUrlError('');
                }}
                autoComplete="off"
                invalid={!!serverUrlError}
                invalidText={serverUrlError}
                helperText="Enter the full URL including protocol and port (e.g., http://localhost:3000/api)"
                size="lg"
              />
            </div>

            {/* Test Connection Button */}
            <div className="mb-6">
              <Button
                kind="secondary"
                onClick={handleTestConnection}
                disabled={testing || !serverUrl.trim()}
                size="lg"
              >
                {testing ? 'Testing Connection...' : 'Test Connection'}
              </Button>
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
                className="mb-6"
              />
            )}

            {/* Connection Status Indicator */}
            {!testResult && serverUrl.trim() && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>⚠️ Action Required:</strong> Please test the
                  connection before proceeding to the next step.
                </p>
              </div>
            )}

            {/* Help Section */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium mb-3 text-blue-900">
                Need Help?
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <strong>Common URLs:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Local development:{' '}
                    <code className="bg-blue-100 px-1 rounded">
                      http://localhost:3000/api
                    </code>
                  </li>
                  <li>
                    Production server:{' '}
                    <code className="bg-blue-100 px-1 rounded">
                      https://your-server.com/api
                    </code>
                  </li>
                  <li>
                    Custom port:{' '}
                    <code className="bg-blue-100 px-1 rounded">
                      http://localhost:8080/api
                    </code>
                  </li>
                </ul>
                <p className="mt-3">
                  <strong>Note:</strong> Make sure the backend server is running
                  and accessible before proceeding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
