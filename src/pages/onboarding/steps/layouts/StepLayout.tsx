import type { ReactNode } from "react";
import { useState } from "react";
import { ProgressIndicator, ProgressStep, Button, InlineNotification } from "@carbon/react";
import { useNavigate } from "react-router-dom";
import { createUser, listUsers } from "../../../../api/users";
import { createGeneralConfig } from "../../../../api/generalConfigs";
import type {CreateUserInput, Role} from "../../../../types/user.ts";

interface StepLayoutProps {
  children: ReactNode;
  currentStep: number;
}

const steps = [
  { label: "Step 1", path: "/onboarding/step1", secondarlyLabel: "Account Setup" },
  { label: "Step 2", path: "/onboarding/step2", secondarlyLabel: "Pharmacy Setup" },
  { label: "Step 3", path: "/onboarding/step3", secondarlyLabel: "Inventory Defaults" },
];

export default function StepLayout({
  children,
  currentStep,
}: StepLayoutProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    // Clear any stored form data
    localStorage.removeItem('onboarding_step1');
    localStorage.removeItem('onboarding_step2');
    localStorage.removeItem('onboarding_step3');
    navigate("/"); 
  };

  // If enforcePasswordMatch = true we verify password === confirmPassword (initial user creation only)
  const validateStep1Data = (data: any, enforcePasswordMatch = false) => {
    if (!data.username?.trim()) return "Username is required";
    if (!data.fullName?.trim()) return "Full name is required";
    // Email optional per new requirement; if provided validate format
    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) return "Invalid email format";
    if (!data.role) return "Role is required";
    if (!data.password?.trim()) return "Password is required";
    if (enforcePasswordMatch && data.password !== data.confirmPassword) return "Passwords do not match";
    return null;
  };

  const validateStep2Data = (data: any) => {
    if (!data.pharmacyName?.trim()) return "Pharmacy name is required";
    if (!data.licenseNumber?.trim()) return "License number is required";
    if (!data.phone?.trim()) return "Phone number is required";
    return null;
  };

  const validateStep3Data = (data: any) => {
    if (!data.lowStockThreshold || isNaN(Number(data.lowStockThreshold))) {
      return "Valid low stock threshold is required";
    }
    if (!data.nearExpiryDays || isNaN(Number(data.nearExpiryDays))) {
      return "Valid near expiry days is required";
    }
    return null;
  };

  const finishOnboarding = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const step1Data = JSON.parse(localStorage.getItem("onboarding_step1") || "{}");
      const step2Data = JSON.parse(localStorage.getItem("onboarding_step2") || "{}");
      const step3Data = JSON.parse(localStorage.getItem("onboarding_step3") || "{}");

      const existing = await listUsers({ limit: 1 });
      const userExists = existing && existing.length > 0;

      const enforcePasswordMatch = !userExists;
      const step1Error = validateStep1Data(step1Data, enforcePasswordMatch);
      if (step1Error) throw new Error(`Step 1: ${step1Error}`);

      if (userExists) {
        navigate("/login");
        return;
      }

      const step2Error = validateStep2Data(step2Data);
      if (step2Error) throw new Error(`Step 2: ${step2Error}`);

      const step3Error = validateStep3Data(step3Data);
      if (step3Error) throw new Error(`Step 3: ${step3Error}`);

      const allowedRoles = ["Admin", "Pharmacist", "Clerk"];
      const rawRole = step1Data.role;
      if (typeof rawRole !== "string" || !allowedRoles.includes(rawRole as Role)) {
        throw new Error("Step 1: Role is invalid or missing. Use one of: Admin, Pharmacist, Clerk");
      }
      const roleValue = rawRole as Role;



      const userPayload: CreateUserInput = {
        username: step1Data.username,
        password: step1Data.password,
        full_name: step1Data.fullName,
        email: step1Data.email || `${step1Data.username}@local`,
        role: roleValue,
      };

      console.info("Creating user with payload:", userPayload);

      // Call createUser and capture any immediate rejection
      try {
        await createUser(userPayload);
      } catch (e: any) {
        // Very verbose logging for API error
        console.error("createUser threw an error (raw):", e);

        // axios-like error shape
        if (e?.response) {
          try {
            console.error("Response status:", e.response.status);
            console.error("Response headers:", e.response.headers);
            console.error("Response data:", e.response.data);
          } catch (logErr) {
            console.error("Error while logging axios-like response:", logErr);
          }
        }

        // fetch Response object
        if (e instanceof Response) {
          try {
            const text = await e.text();
            console.error("Fetch Response text body:", text);
          } catch (readErr) {
            console.error("Failed reading Response body:", readErr);
          }
        }

        // some wrappers expose json()
        if (typeof e?.json === "function") {
          try {
            const j = await e.json();
            console.error("Error json():", j);
          } catch (je) {
            console.error("Failed to read error.json():", je);
          }
        }

        // standard Error
        if (e instanceof Error) {
          console.error("Error message:", e.message);
          console.error("Error stack:", e.stack);
        }

        // fallback stringify
        try {
          console.error("Stringified error:", JSON.stringify(e));
        } catch (_s) {
          console.error("Could not stringify error object");
        }

        // rethrow so outer catch handles cleanup / user notification
        throw e;
      }

      // Create pharmacy configurations
      const configs = [
        { key: "pharmacy_name", value: step2Data.pharmacyName, data_type: "string", category: "pharmacy", description: "Pharmacy name" },
        { key: "license_number", value: step2Data.licenseNumber, data_type: "string", category: "pharmacy", description: "License number" },
        { key: "pharmacy_phone", value: step2Data.phone, data_type: "string", category: "pharmacy", description: "Pharmacy phone number" },
        { key: "pharmacy_city", value: step2Data.city, data_type: "string", category: "pharmacy", description: "Pharmacy city" },
        { key: "pharmacy_subcity", value: step2Data.subCity, data_type: "string", category: "pharmacy", description: "Pharmacy sub-city" },
        { key: "pharmacy_wereda", value: step2Data.wereda, data_type: "string", category: "pharmacy", description: "Pharmacy wereda" },
        { key: "pharmacy_zipcode", value: step2Data.zipCode, data_type: "string", category: "pharmacy", description: "Pharmacy zip code" },
        { key: "pharmacy_address", value: step2Data.address, data_type: "string", category: "pharmacy", description: "Pharmacy address" },
        { key: "low_stock_threshold", value: step3Data.lowStockThreshold, data_type: "integer", category: "inventory", description: "Low stock alert threshold" },
        { key: "default_unit", value: step3Data.defaultUnit, data_type: "string", category: "inventory", description: "Default unit of measure" },
        { key: "expiry_alerts_enabled", value: String(step3Data.expiryAlerts), data_type: "boolean", category: "inventory", description: "Enable expiry alerts" },
        { key: "near_expiry_days", value: step3Data.nearExpiryDays, data_type: "integer", category: "inventory", description: "Near expiry alert days" },
        { key: "auto_lock_enabled", value: String(step1Data.autoLock), data_type: "boolean", category: "security", description: "Enable auto-lock" },
        { key: "onboarding_completed", value: "true", data_type: "boolean", category: "system", description: "Onboarding completion status" },
      ];

      // create configs and log any errors in the Promise.all
      try {
        await Promise.all(
            configs
                .filter(c => c.value !== undefined && c.value !== null && c.value !== '' && c.value !== 'undefined')
                .map(async (c) => {
                  try {
                    return await createGeneralConfig(c);
                  } catch (cfgErr) {
                    console.error("createGeneralConfig error for key", c.key, cfgErr);
                    throw cfgErr;
                  }
                })
        );
      } catch (cfgAllErr) {
        // bubble up after logging
        throw cfgAllErr;
      }

      // Clear form data
      localStorage.removeItem("onboarding_step1");
      localStorage.removeItem("onboarding_step2");
      localStorage.removeItem("onboarding_step3");

      navigate("/login");
    } catch (err: any) {
      // super-verbose final logging
      console.error("Onboarding error (final catch) - raw:", err);

      if (err?.response) {
        console.error("Final catch - response.status:", err.response.status);
        console.error("Final catch - response.data:", err.response.data);
      }

      if (err instanceof Error) {
        console.error("Final catch - message:", err.message);
        console.error("Final catch - stack:", err.stack);
      }

      try {
        console.error("Final catch - stringified:", JSON.stringify(err));
      } catch (_e) {
        console.error("Final catch - could not stringify error");
      }

      // Show friendly message but keep original if available
      setError(err?.message || String(err) || "Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      // This is the finish step
      finishOnboarding();
    } else {
      const next = currentStep + 1;
      navigate(steps[next].path);
    }
  };

  const handleBack = () => {
    const prev = currentStep - 1;
    if (prev >= 0) {
      navigate(steps[prev].path);
    }
  };

  return (
        <div className="flex pl-6 pr-6 pb-6 min-h-screen max-w-[100rem] mx-auto">
          {/* progress indicator */}
          <div className="w-64 p-6 mt-12  border-r">
            <ProgressIndicator className="scale-125 transform origin-top-left" currentIndex={currentStep} vertical >
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
        <div className="flex justify-between items-center mt-10">
          <Button kind="tertiary" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button kind="secondary" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            )}
            <Button 
              kind="primary" 
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : (currentStep === steps.length - 1 ? "Finish" : "Next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
