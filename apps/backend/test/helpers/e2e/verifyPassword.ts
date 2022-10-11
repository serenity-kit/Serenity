import { Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
  password: string;
  throwIfNotOpen?: boolean;
};
export const verifyPassword = async ({
  page,
  password,
  throwIfNotOpen,
}: Props) => {
  // detect if a modal is open
  const modal = page.locator("data-testid=verify-password-modal");
  const isModalOpen = await modal.isVisible();
  if (throwIfNotOpen && !isModalOpen) {
    throw new Error("verify password modal is not open");
  }
  if (isModalOpen) {
    await page
      .locator("data-testid=verify-password-modal__password-input")
      .fill(password);
    await page
      .locator("data-testid=verify-password-modal__submit-button")
      .click();
    await delayForSeconds(2);
  }
};
