import { Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export const openDevicesPanel = async (page: Page) => {
  await page.locator(`data-testid=general__account-menu--trigger`).click();
  await delayForSeconds(1);
  await page
    .locator("data-testid=general__account-menu--account-settings")
    .click();
  await delayForSeconds(1);
  await page.locator("data-testid=account-settings-sidebar--devices").click();
  await delayForSeconds(1);
};
