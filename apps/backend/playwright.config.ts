import { devices, type PlaywrightTestConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".e2e-tests.env") });

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  globalSetup: require.resolve("./test/config/playwrightGlobalSetup"),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 1,
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
  testMatch: /.*.e2e\.ts/,
  timeout: 600000,
};
export default config;
