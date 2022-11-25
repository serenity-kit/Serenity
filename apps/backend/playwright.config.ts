import { devices, type PlaywrightTestConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".e2e-tests.env") });

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  globalSetup: require.resolve("./test/config/playwrightGlobalSetup"),
  retries: process.env.CI ? 4 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: { trace: "on-first-retry" },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
  ],
  testMatch: /.*\.e2e\.ts/,
  timeout: 1200000,
};
export default config;
