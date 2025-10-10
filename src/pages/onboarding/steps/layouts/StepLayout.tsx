import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  ProgressIndicator,
  ProgressStep,
  Button,
  InlineNotification,
} from '@carbon/react';
import { useNavigate } from 'react-router-dom';
import { completeSetup } from '../../../../api/setup';
import type { Role } from '../../../../types/user.ts';

interface StepLayoutProps {
  children: ReactNode;
  currentStep: number;
  canProceed?: boolean; // Allow parent to control if Next button should be enabled
}

const steps = [
  {
    label: 'Step 1',
    path: '/onboarding/step0',
    secondarlyLabel: 'API Server',
  },
  {
    label: 'Step 2',
    path: '/onboarding/step2',
    secondarlyLabel: 'Pharmacy Info',
  },
  {
    label: 'Step 3',
    path: '/onboarding/step1',
    secondarlyLabel: 'Admin Account',
  },
];

export default function StepLayout({
  children,
  currentStep,
  canProceed = true,
}: StepLayoutProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    // Clear any stored form data
    localStorage.removeItem('onboarding_step0');
    localStorage.removeItem('onboarding_step1');
    navigate('/');
  };

  // If enforcePasswordMatch = true we verify password === confirmPassword (initial user creation only)
  const validateStep1Data = (data: any, enforcePasswordMatch = false) => {
    if (!data.username?.trim()) return 'Username is required';
    if (!data.fullName?.trim()) return 'Full name is required';
    // Email optional per new requirement; if provided validate format
    if (data.email && !/\S+@\S+\.\S+/.test(data.email))
      return 'Invalid email format';
    if (!data.role) return 'Role is required';
    if (!data.password?.trim()) return 'Password is required';
    if (enforcePasswordMatch && data.password !== data.confirmPassword)
      return 'Passwords do not match';
    return null;
  };

  const finishOnboarding = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const step0Data = JSON.parse(
        localStorage.getItem('onboarding_step0') || '{}',
      );
      const step1Data = JSON.parse(
        localStorage.getItem('onboarding_step1') || '{}',
      );
      const step2Data = JSON.parse(
        localStorage.getItem('onboarding_step2') || '{}',
      );

      const step1Error = validateStep1Data(step1Data, true);
      if (step1Error) throw new Error(`Step 3: ${step1Error}`);

      const allowedRoles = ['Admin'];
      const rawRole = step1Data.role;
      if (
        typeof rawRole !== 'string' ||
        !allowedRoles.includes(rawRole as Role)
      ) {
        throw new Error(
          'Step 1: Role is invalid or missing. Only Admin role is allowed for account setup',
        );
      }

      const setupPayload = {
        admin: {
          username: step1Data.username,
          password: step1Data.password,
          fullName: step1Data.fullName,
          email: step1Data.email || `${step1Data.username}@local`,
          phoneNumber: step1Data.phoneNumber || undefined,
        },
        systemConfig: {
          pharmacyName: step2Data.pharmacyName,
          pharmacyAddress: step2Data.address,
          pharmacyPhone: step2Data.phone,
          pharmacyCity: step2Data.city,
          apiUrl: step0Data.serverUrl,
          // Default values for required system configuration
          lowStockThreshold: 10,
          expiryWarningDays: 30,
          currency: 'ETB',
          timezone: 'Africa/Addis_Ababa',
        },
      };

      console.info('Setting up system with payload:', setupPayload);

      // Call completeSetup and capture any immediate rejection
      try {
        await completeSetup(setupPayload);
      } catch (e: any) {
        // Very verbose logging for API error
        console.error('completeSetup threw an error (raw):', e);

        // axios-like error shape
        if (e?.response) {
          try {
            console.error('Response status:', e.response.status);
            console.error('Response headers:', e.response.headers);
            console.error('Response data:', e.response.data);
          } catch (logErr) {
            console.error('Error while logging axios-like response:', logErr);
          }
        }

        // fetch Response object
        if (e instanceof Response) {
          try {
            const text = await e.text();
            console.error('Fetch Response text body:', text);
          } catch (readErr) {
            console.error('Failed reading Response body:', readErr);
          }
        }

        // some wrappers expose json()
        if (typeof e?.json === 'function') {
          try {
            const j = await e.json();
            console.error('Error json():', j);
          } catch (je) {
            console.error('Failed to read error.json():', je);
          }
        }

        // standard Error
        if (e instanceof Error) {
          console.error('Error message:', e.message);
          console.error('Error stack:', e.stack);
        }

        // fallback stringify
        try {
          console.error('Stringified error:', JSON.stringify(e));
        } catch (_s) {
          console.error('Could not stringify error object');
        }

        // rethrow so outer catch handles cleanup / user notification
        throw e;
      }

      // System setup completed successfully
      console.info('System setup completed successfully');

      // Clear form data
      localStorage.removeItem('onboarding_step0');
      localStorage.removeItem('onboarding_step1');
      localStorage.removeItem('onboarding_step2');

      navigate('/login');
    } catch (err: any) {
      // super-verbose final logging
      console.error('Onboarding error (final catch) - raw:', err);

      if (err?.response) {
        console.error('Final catch - response.status:', err.response.status);
        console.error('Final catch - response.data:', err.response.data);
      }

      if (err instanceof Error) {
        console.error('Final catch - message:', err.message);
        console.error('Final catch - stack:', err.stack);
      }

      try {
        console.error('Final catch - stringified:', JSON.stringify(err));
      } catch (_e) {
        console.error('Final catch - could not stringify error');
      }

      // Show friendly message but keep original if available
      setError(err?.message || String(err) || 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      // Finish on last step (Admin Account)
      finishOnboarding();
      return;
    }
    const next = currentStep + 1;
    navigate(steps[next].path);
  };

  const handleBack = () => {
    const prev = currentStep - 1;
    if (prev >= 0) {
      navigate(steps[prev].path);
    }
  };

  return (
    <div className="flex pl-6 pr-6 pb-32 min-h-screen max-w-[100rem] mx-auto">
      {/* progress indicator */}
      <div className="w-64 p-6 mt-12  border-r">
        <ProgressIndicator
          className="scale-125 transform origin-top-left"
          currentIndex={currentStep}
          vertical
        >
          {steps.map((step) => (
            <ProgressStep
              key={step.path}
              label={step.label}
              secondaryLabel={step.secondarlyLabel}
              onClick={() => navigate(step.path)}
            />
          ))}
        </ProgressIndicator>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex-1">{children}</div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mb-4">
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError(null)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center mt-8">
          <Button
            kind="tertiary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                kind="secondary"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            <Button
              kind="primary"
              onClick={handleNext}
              disabled={isSubmitting || !canProceed}
            >
              {isSubmitting
                ? 'Processing...'
                : currentStep === steps.length - 1
                  ? 'Finish'
                  : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
