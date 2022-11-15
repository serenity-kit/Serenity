import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  // Go to http://localhost:19006/
  await page.goto("http://localhost:19006/");

  // Go to http://localhost:19006/login
  await page.goto("http://localhost:19006/login");

  // Click [placeholder="Enter your email …"]
  await page.locator('[placeholder="Enter your email …"]').click();

  // Fill [placeholder="Enter your email …"]
  await page.locator('[placeholder="Enter your email …"]').fill("a@a.com");

  // Press Tab
  await page.locator('[placeholder="Enter your email …"]').press("Tab");

  // Fill [placeholder="Enter your password …"]
  await page.locator('[placeholder="Enter your password …"]').fill("pass");

  // Click div[role="button"]:has-text("Log in")
  await page.locator('div[role="button"]:has-text("Log in")').click();
  await expect(page).toHaveURL(
    "http://localhost:19006/workspace/8f832295-4e3a-482f-a506-cb407dc2e650/page/18610bc1-edd5-41af-b3f8-0af282aa230d"
  );

  // Click [data-testid="editor-sidebar__add-image"] div:has-text("Upload Image") >> nth=0
  await page
    .locator(
      '[data-testid="editor-sidebar__add-image"] div:has-text("Upload Image")'
    )
    .first()
    .click();

  // Upload whatsapp-logo.png
  await page
    .locator('[data-testid="editor-sidebar__add-image"]')
    .setInputFiles("whatsapp-logo.png");

  // Click img
  await page.locator("img").click();

  // Click img
  await page.locator("img").click({
    button: "right",
  });
  await expect(page).toHaveURL(
    "http://localhost:19006/workspace/8f832295-4e3a-482f-a506-cb407dc2e650/page/18610bc1-edd5-41af-b3f8-0af282aa230d"
  );

  // Click img
  await page.locator("img").click({
    button: "right",
  });
});
