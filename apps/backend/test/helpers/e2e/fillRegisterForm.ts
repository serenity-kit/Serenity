import { expect, Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
  username: string;
  password: string;
};
export const fillRegisterForm = async ({ page, username, password }: Props) => {
  await page.locator('[placeholder="Enter your email …"]').fill(username);
  await page.locator('[placeholder="Enter your password …"]').fill(password);
  await page
    .locator('[aria-label="This is the terms and condition checkbox"] >> nth=1')
    .click();
  await page.locator('div[role="button"]:has-text("Register")').click();
  await delayForSeconds(3);
  // unverified user should have been created
  const unverifiedUser = await prisma.unverifiedUser.findFirst({
    where: { username },
  });
  expect(unverifiedUser).not.toBe(null);
  const confirmationCode = unverifiedUser?.confirmationCode || "";
  const confirmRegistrationUrl = `http://localhost:19006/registration-verification?username=${encodeURIComponent(
    username
  )}`;

  await expect(page).toHaveURL(confirmRegistrationUrl);
  return {
    confirmationCode,
  };
};
