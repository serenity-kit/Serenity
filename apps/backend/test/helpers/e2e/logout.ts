import { expect, Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
};
export const logout = async ({ page }: Props) => {
  await page.locator("data-testid=general__account-menu--trigger").click();
  await page.locator("data-testid=general__account-menu--logout").click();
  await delayForSeconds(3); // takes a while to first redirecting to logging out page, then to login page
  await expect(page).toHaveURL("http://localhost:3000/login");
  await delayForSeconds(2);
};
