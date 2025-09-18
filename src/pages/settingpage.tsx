
import { useState, useEffect } from "react";
import { Button, Toggle, Select, SelectItem, NumberInput } from "@carbon/react";
import { ArrowLeft } from "@carbon/icons-react";
import { useNavigate } from "react-router-dom";
import { useAppTheme } from "../theme/CarbonThemeProvider";
import { useSettings } from "../hooks/useSettings";

const navItems = [
  { key: "inventory", label: "Inventory" },
  { key: "alerts", label: "Alerts" },
  { key: "userInterface", label: "User Interface" },
  { key: "hardware", label: "Hardware" },
];

export default function SettingPage() {
  const [activeTab, setActiveTab] = useState("inventory");
  // Inventory
  const { settings, loading, saving, saveSetting } = useSettings();
  const [minQuantity1, setMinQuantity1] = useState(50);
  const [minQuantity2, setMinQuantity2] = useState(50);
  // Hardware
  const [allowScanning, setAllowScanning] = useState(true);
  // UI
  const { theme, setTheme } = useAppTheme();
  const [systemTheme, setSystemTheme] = useState(theme);
  // Alerts
  const [enableExpiryAlerts, setEnableExpiryAlerts] = useState(true);
  const [expiryDays, setExpiryDays] = useState(50);
  const navigate = useNavigate();

  // Initialize local state from loaded settings
  useEffect(() => {
    if (!loading) {
      setMinQuantity1(settings.inventory_min_qty_primary);
      setMinQuantity2(settings.inventory_min_qty_secondary);
      setAllowScanning(settings.hardware_allow_scanning);
      setSystemTheme(settings.ui_theme as any);
      setEnableExpiryAlerts(settings.expiry_alerts_enabled);
      setExpiryDays(settings.near_expiry_days);
    }
  }, [loading, settings]);

  const handleSave = async () => {
    if (activeTab === "inventory") {
      await saveSetting('inventory_min_qty_primary', minQuantity1);
      await saveSetting('inventory_min_qty_secondary', minQuantity2);
    } else if (activeTab === "hardware") {
      await saveSetting('hardware_allow_scanning', allowScanning);
    } else if (activeTab === "userInterface") {
      await saveSetting('ui_theme', systemTheme);
      setTheme(systemTheme as any);
    } else if (activeTab === "alerts") {
      await saveSetting('expiry_alerts_enabled', enableExpiryAlerts);
      await saveSetting('near_expiry_days', expiryDays);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    setMinQuantity1(settings.inventory_min_qty_primary);
    setMinQuantity2(settings.inventory_min_qty_secondary);
    setAllowScanning(settings.hardware_allow_scanning);
    setSystemTheme(settings.ui_theme as any);
    setEnableExpiryAlerts(settings.expiry_alerts_enabled);
    setExpiryDays(settings.near_expiry_days);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  // --- Inventory Tab ---
  const renderInventoryContent = () => (
    <div>
    <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--cds-text-primary)' }}>Manage Inventory</h1>
      <div className="space-y-8">
        <div>
      <label className="block text-sm mb-3" style={{ color: 'var(--cds-text-secondary)' }}>Minimum quantity before low-stock</label>
          <NumberInput
            id="min-qty-1"
            min={0}
            value={minQuantity1}
            onChange={(_, { value }) => setMinQuantity1(Number(value))}
            hideLabel
            className="max-w-xs"
            size="lg"
          />
        </div>
        <div>
      <label className="block text-sm mb-3" style={{ color: 'var(--cds-text-secondary)' }}>Minimum quantity before low-stock</label>
          <NumberInput
            id="min-qty-2"
            min={0}
            value={minQuantity2}
            onChange={(_, { value }) => setMinQuantity2(Number(value))}
            hideLabel
            className="max-w-xs"
            size="lg"
          />
        </div>
        <div className="flex gap-4 pt-6">
          <Button kind="secondary" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button kind="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );

  // --- Hardware Tab ---
  const renderHardwareContent = () => (
    <div>
    <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--cds-text-primary)' }}>Manage Inventory</h1>
      <div className="space-y-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 48 }}>
          <Toggle
            id="allowScanning"
            toggled={allowScanning}
            onToggle={setAllowScanning}
            size="md"
            labelA="Off"
            labelB="On"
            className="!mb-0"
          />
      <span style={{ fontSize: 18, color: 'var(--cds-text-primary)', fontWeight: 400, marginLeft: 8 }}>Allow scanning barcodes</span>
        </div>
        <div className="flex gap-4 pt-6">
          <Button kind="secondary" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button kind="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );

  // --- User Interface Tab ---
  const renderUserInterfaceContent = () => (
    <div>
    <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--cds-text-primary)' }}>User Interface</h1>
      <div className="space-y-8">
        <div>
      <label className="block text-sm mb-3" style={{ color: 'var(--cds-text-secondary)' }}>System theme</label>
          <div className="max-w-xs">
            <Select
              id="systemTheme"
              value={systemTheme}
              onChange={(e) => setSystemTheme(e.target.value as any)}
              className="w-full"
              size="lg"
            >
              <SelectItem value="Light" text="Light" />
              <SelectItem value="Dark" text="Dark" />
            </Select>
          </div>
        </div>
        <div className="flex gap-4 pt-6">
          <Button kind="secondary" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button kind="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );

  // --- Alerts Tab ---
  const renderAlertsContent = () => (
    <div>
      <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--cds-text-primary)' }}>Alerts</h1>
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <Toggle
            id="enableExpiryAlerts"
            toggled={enableExpiryAlerts}
            onToggle={setEnableExpiryAlerts}
            size="md"
            labelA="Off"
            labelB="On"
            className="!mb-0"
          />
          <span className="text-base font-semibold" style={{ color: 'var(--cds-text-primary)' }}>Enable Expiry Date Alerts</span>
        </div>
        {enableExpiryAlerts && (
          <div>
            <label className="block text-sm mb-3" style={{ color: 'var(--cds-text-secondary)' }}>Warn this number of days before expiry</label>
            <NumberInput
              id="expiry-days"
              min={1}
              value={expiryDays}
              onChange={(_, { value }) => setExpiryDays(Number(value))}
              hideLabel
              className="max-w-xs"
              size="lg"
            />
          </div>
        )}
        <div className="flex gap-4 pt-6">
          <Button kind="secondary" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button kind="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "inventory":
        return renderInventoryContent();
      case "hardware":
        return renderHardwareContent();
      case "userInterface":
        return renderUserInterfaceContent();
      case "alerts":
        return renderAlertsContent();
      default:
        return renderInventoryContent();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cds-background)' }}>
      {/* Back Button - Top Left Corner */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={ArrowLeft}
          onClick={handleBack}
        >
          Back
        </Button>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-56 min-h-screen" style={{ backgroundColor: 'var(--cds-layer)' }}>
          <div className="py-4 pt-16">
            <nav className="flex flex-col">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  className={`text-left px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === item.key
                      ? "border-r-2"
                      : "hover:opacity-80"
                  }`}
                  onClick={() => setActiveTab(item.key)}
                  style={
                    activeTab === item.key
                      ? { backgroundColor: 'var(--cds-layer-active)', color: 'var(--cds-text-primary)', borderRightColor: 'var(--cds-border-interactive)' }
                      : { backgroundColor: 'transparent', color: 'var(--cds-text-secondary)' }
                  }
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1" style={{ backgroundColor: 'var(--cds-background)' }}>
          {/* Content Area */}
          <div className="p-6 pt-16">
            <div className="rounded-lg p-8 max-w-2xl" style={{ backgroundColor: 'var(--cds-layer)', border: '1px solid var(--cds-border-subtle)', boxShadow: 'var(--cds-shadow)', }}>
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}