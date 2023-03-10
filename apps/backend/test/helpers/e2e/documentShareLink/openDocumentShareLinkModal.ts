import { expect, Page } from "@playwright/test";
import { delayForSeconds } from "../../delayForSeconds";

export type Props = {
  page: Page;
};
export const openDocumentShareLinkModal = async ({ page }: Props) => {
  const modal = page.locator("data-testid=document-share-modal");
  const isModalVisibleBefore = await modal.isVisible();
  if (!isModalVisibleBefore) {
    await page.locator("data-testid=document-share-button").click();
    await delayForSeconds(1);
  }
  const isModalVisibleAfter = await modal.isVisible();
  expect(isModalVisibleAfter).toBe(true);
};
