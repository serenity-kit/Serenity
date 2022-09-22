import { Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export const reloadPage = async (page: Page) => {
  await page.reload();
  await delayForSeconds(2);
};
