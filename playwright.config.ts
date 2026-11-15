import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://localhost:4174" },
  webServer: {
    command: "npm run build && npm run preview",
    port: 4174,
    // sempre monta e sobe o build atual; se a porta estiver ocupada, falha em vez de testar outro site
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "celular", use: { ...devices["iPhone 13"], browserName: "chromium" } },
  ],
});
