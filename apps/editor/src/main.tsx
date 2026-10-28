import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

async function boot(): Promise<void> {
  if (import.meta.env.DEV) {
    await import("virtual:stylex:runtime");
  }
  const root = document.getElementById("root");
  if (!root) throw new Error("root element is missing");
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void boot();
