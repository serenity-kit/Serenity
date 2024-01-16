import { expect, Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";
import { verifyPassword } from "./verifyPassword";

export type Props = {
  page: Page;
  password: string;
  throwIfPasswordVerifyNotOpen: boolean;
};
export const logout = async ({
  page,
  password,
  throwIfPasswordVerifyNotOpen,
}: Props) => {
  await page.locator("data-testid=general__account-menu--trigger").click();
  await delayForSeconds(4);
  await page.locator("data-testid=general__account-menu--logout").click();
  await delayForSeconds(1);
  await verifyPassword({
    page,
    password,
    throwIfNotOpen: throwIfPasswordVerifyNotOpen,
  });
  await delayForSeconds(2);
  await expect(page).toHaveURL("http://localhost:19006/login");
  await delayForSeconds(2);
};
