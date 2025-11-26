import { useState, useMemo, useEffect } from 'react';
import StepLayout from '../layouts/StepLayout';
import {
  TextInput,
  Select,
  SelectItem,
  PasswordInput,
  InlineNotification,
} from '@carbon/react';
import { useRoles } from '../../../../hooks/useRoles';
import { authStatus } from '../../../../api/auth';
import { useNavigate } from 'react-router-dom';

export default function Step1() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'' | 'Admin'>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { loading: rolesLoading } = useRoles();

  // Only allow Admin role for account setup
  const roleOptions = useMemo(() => [{ text: 'Admin', value: 'Admin' }], []);

  // Store form data in localStorage for StepLayout to access (ensure latest value, avoiding stale state reads)
  const persistForm = (overrides: Partial<Record<string, any>> = {}) => {
    const formData = {
      username,
      role,
      password,
      confirmPassword,
      fullName,
      email,
      phoneNumber,
      ...overrides,
    };
    localStorage.setItem('onboarding_step1', JSON.stringify(formData));
  };

  useEffect(() => {
    (async () => {
      try {
        const status = await authStatus();
        if (status?.hasAdminUser) {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        // If API connection fails, show error and redirect back to step 0
        console.error('API connection failed:', error);
        setError(
          'API connection failed. Please check your server URL configuration.',
        );
        // Redirect after a short delay to show the error message
        setTimeout(() => {
          navigate('/onboarding/step0', { replace: true });
        }, 2000);
      }
    })();
  }, [navigate]);

  return (
    <StepLayout currentStep={2}>
      <div className="flex flex-col mt-6 px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-7xl mx-auto">
          {/* Form Section */}
          <div className="md:col-span-3">
            <h2 className="text-4xl font-extralight mb-3">Account Setup</h2>
            <p className="mb-8 text-xl font-extralight">
              Setup a local account to get started
            </p>

            {error && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={error}
                onCloseButtonClick={() => setError(null)}
                className="mb-6"
              />
            )}

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <TextInput
                id="full-name"
                labelText="Full Name"
                placeholder="Enter Full Name"
                size="lg"
                value={fullName}
                onChange={(e) => {
                  const v = e.target.value;
                  setFullName(v);
                  persistForm({ fullName: v });
                }}
                autoComplete="off"
              />
              <TextInput
                id="email"
                labelText="Email"
                placeholder="Enter Email Address"
                size="lg"
                value={email}
                onChange={(e) => {
                  const v = e.target.value;
                  setEmail(v);
                  persistForm({ email: v });
                }}
                autoComplete="off"
              />
              <TextInput
                id="phone-number"
                labelText="Phone Number"
                placeholder="Enter Phone Number (optional)"
                size="lg"
                value={phoneNumber}
                onChange={(e) => {
                  const v = e.target.value;
                  setPhoneNumber(v);
                  persistForm({ phoneNumber: v });
                }}
                autoComplete="off"
              />
              <TextInput
                id="username"
                labelText="Username"
                placeholder="Enter Username"
                size="lg"
                value={username}
                onChange={(e) => {
                  const v = e.target.value;
                  setUsername(v);
                  persistForm({ username: v });
                }}
                autoComplete="off"
              />
              <Select
                id="role"
                labelText="Role"
                value={role}
                size="lg"
                onChange={(e) => {
                  const v = e.target.value as '' | 'Admin';
                  setRole(v);
                  persistForm({ role: v });
                }}
                disabled={rolesLoading}
              >
                <SelectItem disabled value="" text="Choose a Role" />
                {roleOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    text={opt.text}
                  />
                ))}
              </Select>
              <PasswordInput
                id="password"
                labelText="Password"
                placeholder="Enter your password"
                size="lg"
                hidePasswordLabel="Hide password"
                showPasswordLabel="Show password"
                value={password}
                onChange={(e) => {
                  const v = e.target.value;
                  setPassword(v);
                  persistForm({ password: v });
                }}
                autoComplete="off"
              />
              <PasswordInput
                id="confirm-password"
                labelText="Confirm Password"
                placeholder="Confirm your password"
                size="lg"
                hidePasswordLabel="Hide password"
                showPasswordLabel="Show password"
                value={confirmPassword}
                onChange={(e) => {
                  const v = e.target.value;
                  setConfirmPassword(v);
                }}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
