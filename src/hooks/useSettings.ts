import { useCallback, useEffect, useState } from 'react';
import {
  listGeneralConfigs,
  createGeneralConfig,
  updateGeneralConfig,
} from '../api/generalConfigs';

interface SettingsState {
  inventory_min_qty_primary: number;
  inventory_min_qty_secondary: number;
  hardware_allow_scanning: boolean;
  ui_theme: string;
  expiry_alerts_enabled: boolean;
  near_expiry_days: number;
}

const defaults: SettingsState = {
  inventory_min_qty_primary: 50,
  inventory_min_qty_secondary: 50,
  hardware_allow_scanning: true,
  ui_theme: 'Light',
  expiry_alerts_enabled: true,
  near_expiry_days: 50,
};

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const rows = await listGeneralConfigs(); // fetch default batch
        const map: Partial<SettingsState> = {};
        rows.forEach((r) => {
          switch (r.key) {
            case 'inventory_min_qty_primary':
            case 'inventory_min_qty_secondary':
            case 'near_expiry_days':
              map[r.key as keyof SettingsState] = Number(r.value) as any;
              break;
            case 'hardware_allow_scanning':
            case 'expiry_alerts_enabled':
              map[r.key as keyof SettingsState] = (r.value === 'true') as any;
              break;
            case 'ui_theme':
              map.ui_theme = r.value;
              break;
          }
        });
        setSettings((prev) => ({ ...prev, ...map }));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveSetting = useCallback(
    async (key: keyof SettingsState, value: string | number | boolean) => {
      setSaving(true);
      try {
        // Try to find existing config
        // Fetch all (small set) then locate exact key to ensure we have id
        const rows = await listGeneralConfigs();
        const existing = rows.find((r) => r.key === key);
        const input = {
          key,
          value: String(value),
          dataType:
            typeof value === 'number'
              ? 'number'
              : typeof value === 'boolean'
                ? 'boolean'
                : 'string',
          category: key.startsWith('inventory_')
            ? 'inventory'
            : key.startsWith('hardware_')
              ? 'hardware'
              : key.startsWith('expiry_') || key.startsWith('near_')
                ? 'inventory'
                : key.startsWith('ui_')
                  ? 'ui'
                  : 'system',
          description: key.replace(/_/g, ' '),
        };
        if (existing) {
          await updateGeneralConfig(existing.general_config_id, input);
        } else {
          await createGeneralConfig(input);
        }
        setSettings((prev) => ({ ...prev, [key]: value }));
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { settings, loading, saving, saveSetting };
}
