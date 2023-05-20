import { expect, test } from "@playwright/test";
import { generateId } from "@serenity-tools/common";
import { MAX_UNVERIFIED_USER_CONFIRMATION_ATTEMPTS } from "../../../src/database/authentication/verifyRegistration";
import { prisma } from "../../../src/database/prisma";

import { delayForSeconds } from "../../helpers/delayForSeconds";
import { fillRegisterForm } from "../../helpers/e2e/fillRegisterForm";
import { verifyRegistration } from "../../helpers/e2e/verifyRegistration";

test("Register Properly", async ({ page }) => {
  const username = `${generateId()}@example.com`;
  const password = "password";
  // Go to registration url
  await page.goto("http://localhost:19006/register");
  await delayForSeconds(2);
  const { confirmationCode } = await fillRegisterForm({
    page,
    username,
    password,
  });
  await verifyRegistration({ page, confirmationCode });
  await expect(page).toHaveURL("http://localhost:19006/onboarding");
});

test("One wrong code", async ({ page }) => {
  const username = `${generateId()}@example.com`;
  const password = "password";
  await page.goto("http://localhost:19006/register");
  await delayForSeconds(2);
  const { confirmationCode } = await fillRegisterForm({
    page,
    username,
    password,
  });
  await verifyRegistration({ page, confirmationCode: "badConfirmationCode" });
  const error = page.locator(
    "data-testid=verify-registration__invalidCodeError"
  );
  await expect(error).toBeVisible();

  await verifyRegistration({ page, confirmationCode });
  // TODO: get the workspace id and expect URL to match
  await expect(page).toHaveURL("http://localhost:19006/onboarding");
});

test("max wrong codes", async ({ page }) => {
  const username = `${generateId()}@example.com`;
  const password = "password";
  await page.goto("http://localhost:19006/register");
  await delayForSeconds(2);

  const { confirmationCode } = await fillRegisterForm({
    page,
    username,
    password,
  });
  let attemptNumber = 1;
  while (attemptNumber < MAX_UNVERIFIED_USER_CONFIRMATION_ATTEMPTS) {
    await verifyRegistration({
      page,
      confirmationCode: `attempt ${attemptNumber}`,
    });
    const invalidCodeError = page.locator(
      "data-testid=verify-registration__invalidCodeError"
    );
    await expect(invalidCodeError).toBeVisible();
    attemptNumber += 1;
  }
  await verifyRegistration({
    page,
    confirmationCode: `attempt ${attemptNumber}`,
  });
  const maxRetriesError = page.locator(
    "data-testid=verify-registration__maxRetriesError"
  );
  await expect(maxRetriesError).toBeVisible();

  const unverifiedUser = await prisma.unverifiedUser.findFirst({
    where: { username },
  });
  expect(unverifiedUser).not.toBe(null);
  const newConfirmationCode = unverifiedUser?.confirmationCode;
  expect(newConfirmationCode).not.toBe(null);
  expect(newConfirmationCode).not.toBe(confirmationCode);

  await verifyRegistration({ page, confirmationCode: newConfirmationCode });
  // TODO: get the workspace id and expect URL to match
  await expect(page).toHaveURL("http://localhost:19006/onboarding");
});
