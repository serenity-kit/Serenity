import { Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
};
export const reloadPage = async ({ page }: Props) => {
  await page.reload();
  await delayForSeconds(2);
};
