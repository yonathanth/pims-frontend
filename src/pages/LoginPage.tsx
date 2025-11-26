import { useState } from 'react';
import {
  Button,
  TextInput,
  PasswordInput,
  InlineNotification,
} from '@carbon/react';
import {
  Login as LoginIcon,
  Settings as SettingsIcon,
  Debug as DebugIcon,
} from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import ServerConfigModal from '../components/ServerConfigModal';
import DebugPanel from '../components/DebugPanel';
import logo from '../assets/Logo.svg';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isServerConfigOpen, setIsServerConfigOpen] = useState(false);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!username.trim()) {
      setError('Username is required');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      const session = await login(username, password);
      localStorage.setItem('session', JSON.stringify(session));

      // Redirect based on user role
      if (session.user?.role === 'SELLER') {
        navigate('/dashboard/seller');
      } else if (session.user?.role === 'PHARMACIST') {
        navigate('/dashboard/inventory');
      } else {
        // ADMIN and MANAGER default to admin dashboard
        navigate('/dashboard/admin');
      }
    } catch (err: any) {
      if (err.status === 401) {
        setError(
          'Invalid username or password. Please check your credentials.',
        );
      } else if (err.status === 404) {
        setError('No admin user found. Please complete setup first.');
        navigate('/onboarding/step1');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="PIMS Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-extralight mb-2">
            Welcome to <strong>PIMS</strong>
          </h1>
          <p className="text-lg" style={{ color: 'var(--cds-text-secondary)' }}>
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div
          className="p-8 rounded-lg shadow-lg"
          style={{
            backgroundColor: 'var(--cds-layer)',
            border: '1px solid var(--cds-border-subtle)',
          }}
        >
          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError(null)}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              id="username"
              labelText="Username"
              placeholder="Enter your username"
              size="lg"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="off"
            />

            <PasswordInput
              id="password"
              labelText="Password"
              placeholder="Enter your password"
              size="lg"
              hidePasswordLabel="Hide password"
              showPasswordLabel="Show password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="off"
            />

            <Button
              type="submit"
              kind="primary"
              size="lg"
              className="w-full"
              renderIcon={LoginIcon}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Subtle Settings and Debug Buttons */}
          <div className="mt-6 text-center space-x-4">
            <Button
              kind="ghost"
              size="sm"
              onClick={() => setIsServerConfigOpen(true)}
              renderIcon={SettingsIcon}
              className="text-gray-500 hover:text-gray-700"
            >
              Server Configuration
            </Button>
            <Button
              kind="ghost"
              size="sm"
              onClick={() => setIsDebugPanelOpen(true)}
              renderIcon={DebugIcon}
              className="text-gray-500 hover:text-gray-700"
            >
              Debug Logs
            </Button>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <div
              className="mt-4 pt-4"
              style={{ borderTop: '1px solid var(--cds-border-subtle)' }}
            ></div>
          </div>
        </div>

        {/* System Info */}
        <div className="text-center mt-6">
          <p className="text-xs" style={{ color: 'var(--cds-text-secondary)' }}>
            PIMS v1.0 - Pharmacy Inventory Management System
          </p>
        </div>
      </div>

      {/* Server Configuration Modal */}
      <ServerConfigModal
        isOpen={isServerConfigOpen}
        onClose={() => setIsServerConfigOpen(false)}
      />

      {/* Debug Panel */}
      <DebugPanel
        isOpen={isDebugPanelOpen}
        onClose={() => setIsDebugPanelOpen(false)}
      />
    </div>
  );
}
