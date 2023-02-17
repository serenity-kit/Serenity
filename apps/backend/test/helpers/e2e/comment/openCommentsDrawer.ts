import { Page } from "@playwright/test";
import { delayForSeconds } from "../../delayForSeconds";

export type Props = {
  page: Page;
};
export const openCommentsDrawer = async ({ page }: Props) => {
  await page.locator('[data-testid="open-comments-drawer-button"]').click();
  await delayForSeconds(1);
};
