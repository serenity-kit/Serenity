import { expect, test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../../helpers/delayForSeconds";

test("Register", async ({ page }) => {
  const username = `${uuidv4()}@example.com`;
  const password = "password";
  const workspaceName = "my workspace";

  // Go to registration url
  await page.goto("http://localhost:3000/register");
  await delayForSeconds(2);

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

  await delayForSeconds(3);
  // unverified user should have been created
  const unverifiedUser = await prisma.unverifiedUser.findFirst({
    where: { username },
  });
  expect(unverifiedUser).not.toBe(null);
  const confirmationCode = unverifiedUser?.confirmationCode || "";
  const confirmRegistrationUrl = `http://localhost:3000/registration-verification?username=${encodeURIComponent(
    username
  )}&verification=${encodeURIComponent(confirmationCode)}`;

  await expect(page).toHaveURL(confirmRegistrationUrl);

  // TODO: fill in the verification code from data retrieved from user table
  await page
    .locator('[placeholder="Enter the verification code …"]')
    .fill(confirmationCode);

  // Click the "Verify registration" button
  await page
    .locator(
      'text=Verify your emailPlease enter the verification code sent to you via email.Verifi >> div[role="button"]'
    )
    .click();
  await expect(page).toHaveURL("http://localhost:3000/onboarding");

  // Fill in the new workspace name
  await page
    .locator(
      'text=Workspace nameThis is the name of your organization, team or private notes. You  >> input[type="text"]'
    )
    .fill(workspaceName);

  // Click the "create" button
  await page.locator('div[role="button"]:has-text("Create")').click();

  await delayForSeconds(5);
  const user = await prisma.user.findFirst({
    where: { username },
  });
  expect(user).not.toBe(null);
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId: user?.id,
    },
  });
  expect(userToWorkspace).not.toBe(null);
  const workspaceId = userToWorkspace?.workspaceId;
  const workspace = await prisma.workspace.findFirst({
    where: {
      name: workspaceName,
      id: workspaceId,
    },
  });
  expect(workspace).not.toBe(null);
  // a page will have been created
  const document = await prisma.document.findFirst({
    where: {
      workspaceId,
    },
  });
  expect(document).not.toBe(null);
  const documentId = document?.id;
  // TODO: get the workspace id and expect URL to match
  await expect(page).toHaveURL(
    `http://localhost:3000/workspace/${workspaceId}/page/${documentId}`
  );
});
