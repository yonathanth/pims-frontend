import { useState, useEffect } from "react";
import { useGeneralConfigs } from "./useGeneralConfigs";

export function useOnboardingStatus() {
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { configs, loading: configsLoading } = useGeneralConfigs("system");

  useEffect(() => {
    if (!configsLoading) {
      const completionConfig = configs.find(c => c.key === "onboarding_completed");
      setIsCompleted(completionConfig?.value === "true");
      setIsLoading(false);
    }
  }, [configs, configsLoading]);

  return { isCompleted, isLoading };
}
