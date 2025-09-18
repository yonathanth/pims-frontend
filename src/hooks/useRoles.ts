import { useEffect, useState, useCallback } from "react";
import { call } from "../api/tauriClient";

export type Role = { id: number; name: string };

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await call<any[]>("list_roles", { query: {} });
      const mapped = (res || [])
        .map((r: any) => ({
          id: r.roleId ?? r.role_id ?? r.id ?? r.role?.roleId ?? r.role?.role_id,
          name: r.name ?? r.role?.name,
        }))
        .filter((r: any) => r.id && r.name);
      setRoles(mapped);
      setError(null);
    } catch (e) {
      setRoles([]);
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, loading, error, refetch: fetchRoles };
}
