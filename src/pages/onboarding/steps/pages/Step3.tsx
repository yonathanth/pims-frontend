import { useState } from "react";
import {
    TextInput,
    Select,
    SelectItem,
    Toggle,
    InlineNotification
} from "@carbon/react";
import StepLayout from "../layouts/StepLayout";

export default function Step3() {
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [defaultUnit, setDefaultUnit] = useState("");
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [nearExpiryDays, setNearExpiryDays] = useState("30");
  const [error, setError] = useState<string | null>(null);

  // Store form data in localStorage for StepLayout to access
  const handleFieldChange = () => {
    const formData = {
      lowStockThreshold,
      defaultUnit,
      expiryAlerts,
      nearExpiryDays
    };
    localStorage.setItem('onboarding_step3', JSON.stringify(formData));
  };

  return (
    <StepLayout currentStep={2}>
      <div className="flex flex-col mt-6 px-6 py-8">
        <div className="max-w-3xl w-full">
          <h2 className="text-4xl font-extralight mb-3">Inventory Defaults</h2>
          <p className="mb-8 text-xl font-extralight">Set default values for inventory tracking</p>

          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError(null)}
              className="mb-6"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <TextInput
              id="low-stock-threshold"
              labelText="Low-Stock Alert Threshold"
              placeholder="Enter Value"
              size="lg"
              value={lowStockThreshold}
              onChange={(e) => { setLowStockThreshold(e.target.value); handleFieldChange(); }}
            />

            <Select
              id="default-unit"
              labelText="Default Unit of Measure"
              value={defaultUnit}
              size="lg"
              onChange={(e) => { setDefaultUnit(e.target.value); handleFieldChange(); }}
            >
              <SelectItem value="" text="Select Unit" />
              <SelectItem value="tablet" text="Tablet" />
              <SelectItem value="capsule" text="Capsule" />
              <SelectItem value="ml" text="Milliliter (ml)" />
              <SelectItem value="bottle" text="Bottle" />
              <SelectItem value="box" text="Box" />
              <SelectItem value="vial" text="Vial" />
              <SelectItem value="tube" text="Tube" />
              <SelectItem value="sachet" text="Sachet" />
            </Select>

            <TextInput
              id="near-expiry-days"
              labelText="Near-Expiry Alert (Days)"
              placeholder="Days before expiry"
              size="lg"
              value={nearExpiryDays}
              onChange={(e) => { setNearExpiryDays(e.target.value); handleFieldChange(); }}
            />
          </div>

          <Toggle
            id="expiry-toggle"
            labelText="Enable Expiry Date Alerts"
            labelA="Off"
            labelB="On"
            toggled={expiryAlerts}
            onToggle={(toggled) => { setExpiryAlerts(toggled); handleFieldChange(); }}
          />
        </div>
      </div>
    </StepLayout>
  );
}
  