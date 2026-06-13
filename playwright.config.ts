import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "bun run preview --port 8080",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
    stderr: "pipe",
    stdout: "ignore",
  },
  use: {
    baseURL: "http://localhost:8080",
    headless: true,
    viewport: { width: 1280, height: 900 },
  },
  testDir: "e2e",
  timeout: 30000,
});
