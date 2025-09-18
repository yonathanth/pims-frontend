import { useState } from 'react';
import {
  Button,
  TextInput,
  PasswordInput,
  InlineNotification,
} from '@carbon/react';
import { Login as LoginIcon } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import { login, authStatus } from '../api/auth';
import logo from '../assets/Logo.svg';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const status = await authStatus();
      if (!status.hasUser) {
        setError('No admin user found. Please complete setup first.');
        navigate('/onboarding/step1');
        return;
      }

      const session = await login(username, password);
      localStorage.setItem('session', JSON.stringify(session));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
    </div>
  );
}
