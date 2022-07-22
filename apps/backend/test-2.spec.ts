import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {

  // Go to http://localhost:19006/accept-workspace-invitation/a0b6f139-3df4-4b04-b9cd-33cce67c76bf
  await page.goto('http://localhost:19006/accept-workspace-invitation/a0b6f139-3df4-4b04-b9cd-33cce67c76bf');

  // Click text=Register here
  await page.locator('text=Register here').click();

  // Click [placeholder="Enter your email …"]
  await page.locator('[placeholder="Enter your email …"]').click();

  // Fill [placeholder="Enter your email …"]
  await page.locator('[placeholder="Enter your email …"]').fill('b@b.com');

  // Press Tab
  await page.locator('[placeholder="Enter your email …"]').press('Tab');

  // Fill [placeholder="Enter your password …"]
  await page.locator('[placeholder="Enter your password …"]').fill('pass');

  // Click div > div:nth-child(2) > .css-view-1dbjc4n
  await page.locator('div > div:nth-child(2) > .css-view-1dbjc4n').click();

  // Click div[role="button"]:has-text("Register")
  await page.locator('div[role="button"]:has-text("Register")').click();
  await expect(page).toHaveURL('http://localhost:19006/registration-verification?username=b%40b.com&verification=01224865');

  // Click text=Verify your EmailPlease enter the verification code sent to you via Email.Verifi >> div[role="button"]
  await page.locator('text=Verify your EmailPlease enter the verification code sent to you via Email.Verifi >> div[role="button"]').click();
  await expect(page).toHaveURL('http://localhost:19006/workspace/7193a825-0dca-4209-8cb4-0808563d104e/page/74d39018-2c8a-4be4-9c6a-af0d02c0f013');

});