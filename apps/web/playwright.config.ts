import { defineConfig } from "@playwright/test";
import os from "node:os";
import path from "node:path";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3001";
const outputDir = path.join(os.tmpdir(), "carolina-growth-playwright");

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: {
    command: "npm run build && npm run start -- --port 3001",
    port: 3001,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    cwd: __dirname,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
  },
});
