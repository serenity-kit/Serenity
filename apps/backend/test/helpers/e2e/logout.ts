import { expect, Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
};
export const logout = async ({ page }: Props) => {
  await page.locator("data-testid=account-menu-trigger").click();
  await page.locator("data-testid=account-menu__logout-button").click();
  await delayForSeconds(2);
  await expect(page).toHaveURL("http://localhost:3000/login");
  await delayForSeconds(2);
};
