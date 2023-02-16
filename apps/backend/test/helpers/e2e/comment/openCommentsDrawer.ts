import { Page } from "@playwright/test";

export type Props = {
  page: Page;
};
export const openCommentsDrawer = async ({ page }: Props) => {
  await page.locator('[data-testid="open-comments-drawer-button"]').click();
};
