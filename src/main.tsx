import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./Router.tsx";
import { CarbonThemeProvider } from "./theme/CarbonThemeProvider";

// Expose Tauri core API for convenient testing in DevTools during development
if (import.meta && (import.meta as any).env && (import.meta as any).env.DEV) {
  // @ts-ignore
  (window as any).__TAURI__ = { core: import("@tauri-apps/api/core") };
  // Optional visibility
  // eslit-disable-next-line no-console
  console.log("__TAURI__ core attached for dev console testing");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CarbonThemeProvider>
      <AppRouter />
    </CarbonThemeProvider>
  </StrictMode>
);
