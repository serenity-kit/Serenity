import { expect, test } from "@playwright/test";

test("test", async ({ page }) => {
  // Click div[role="button"]:has-text("a space")
  await page.locator('div[role="button"]:has-text("a space")').click();

  // Click #react-native-popper-content-2 > div > div > div > div > div:nth-child(5) > .css-view-175oi2r
  await page
    .locator(
      "#react-native-popper-content-2 > div > div > div > div > div:nth-child(5) > .css-view-175oi2r"
    )
    .click();
  await expect(page).toHaveURL("http://localhost:19006/login");
});
