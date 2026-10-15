import { defineConfig } from "@playwright/test";

const TEST_DB = "postgresql://andrew@localhost:5432/streamsicle_test?host=/var/run/postgresql";
const TEST_PORT = 3969;

export default defineConfig({
  globalSetup: "./e2e/global-setup.ts",
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  workers: 1,
  reporter: "list",
  timeout: 45000,
  expect: { timeout: 15000 },
  use: {
    baseURL: `http://localhost:${TEST_PORT}`,
    trace: "on-first-retry",
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },
  webServer: {
    command: `DATABASE_URL="${TEST_DB}" npx next start --port ${TEST_PORT}`,
    url: `http://localhost:${TEST_PORT}`,
    reuseExistingServer: false,
    timeout: 15000,
    env: { DATABASE_URL: TEST_DB },
  },
});
