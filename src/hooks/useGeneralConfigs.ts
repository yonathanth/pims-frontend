import { useEffect, useState, useCallback } from "react";
import { listGeneralConfigs } from "../api/generalConfigs";

export type GeneralConfig = {
  id: number;
  key: string;
  value: string;
  dataType: string;
  category: string;
  description?: string | null;
};

export function useGeneralConfigs(category?: string) {
  const [configs, setConfigs] = useState<GeneralConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listGeneralConfigs({ category, limit: 100 });
      const mapped = (res || []).map((c: any) => ({
        id: c.configId ?? c.config_id ?? c.id,
        key: c.key,
        value: c.value,
        dataType: c.dataType ?? c.data_type,
        category: c.category,
        description: c.description,
      }));
      setConfigs(mapped);
      setError(null);
    } catch (e) {
      setConfigs([]);
      setError("Failed to load configurations");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return { configs, loading, error, refetch: fetchConfigs };
}
