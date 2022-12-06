import { expect, Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../delayForSeconds";
import { verifyRegistration } from "./verifyRegistration";

type RegisterOnPageProps = {
  page: Page;
  username: string;
  password: string;
  workspaceName: string;
};
export const registerOnPage = async ({
  page,
  username,
  password,
  workspaceName,
}: RegisterOnPageProps) => {
  // Fill username
  await page.locator('[placeholder="Enter your email …"]').fill(username);

  // Fill password
  await page.locator('[placeholder="Enter your password …"]').fill(password);

  // Click "i agree" checkbox
  await page
    .locator('[aria-label="This is the terms and condition checkbox"] >> nth=1')
    .click();

  // Click "register button"
  await page.locator('div[role="button"]:has-text("Register")').click();

  await delayForSeconds(1);
  // unverified user should have been created
  const unverifiedUser = await prisma.unverifiedUser.findFirst({
    where: { username },
  });
  expect(unverifiedUser).not.toBe(null);
  const confirmationCode = unverifiedUser?.confirmationCode || "";
  const confirmRegistrationUrl = `http://localhost:19006/registration-verification?username=${encodeURIComponent(
    username
  )}&verification=${encodeURIComponent(confirmationCode)}`;

  await expect(page).toHaveURL(confirmRegistrationUrl);
  await verifyRegistration({ page, confirmationCode });
};
