import { Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
  confirmationCode?: string | undefined;
};
export const verifyRegistration = async ({ page, confirmationCode }: Props) => {
  const confirmationCodeInput = page.locator(
    "data-testid=verify-registration__input"
  );
  if (confirmationCode) {
    await confirmationCodeInput.fill(confirmationCode);
  }
  // Click the "Verify registration" button
  await page.locator("data-testid=verify-registration__button").click();
  await delayForSeconds(2);
};
