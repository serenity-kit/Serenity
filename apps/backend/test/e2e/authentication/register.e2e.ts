import { test, expect } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import deleteAllRecords from "../../helpers/deleteAllRecords";

test.beforeAll(async () => {
  await deleteAllRecords();
});

test("Register", async ({ page }) => {
  const username = "user1@example.com";
  const password = "password";
  const workspaceName = "my workspace";

  // Go to registration url
  await page.goto("http://localhost:19006/register");

  // Fill username
  await page.locator('[placeholder="Enter your email …"]').fill(username);

  // Fill password
  await page.locator('[placeholder="Enter your password …"]').fill(password);

  // Click "i agree" checkbox
  await page.locator("div > div:nth-child(2) > .css-view-1dbjc4n").click();

  // Click "register button"
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
  )}&verification=${encodeURIComponent(confirmationCode)}`;

  await expect(page).toHaveURL(confirmRegistrationUrl);

  // TODO: fill in the verification code from data retrieved from user table
  await page
    .locator('[placeholder="Enter the verification code …"]')
    .fill(confirmationCode);

  // Click the "Verify registration" button
  await page
    .locator(
      'text=Verify your EmailPlease enter the verification code sent to you via Email.Verifi >> div[role="button"]'
    )
    .click();
  await expect(page).toHaveURL("http://localhost:19006/onboarding");

  // Fill in the new workspace name
  await page
    .locator(
      'text=Workspace NameThis is the name of your organization, team or private notes. You  >> input[type="text"]'
    )
    .fill(workspaceName);

  // Click the "create" button
  await page.locator('div[role="button"]:has-text("Create")').click();

  await delayForSeconds(1);
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
    `http://localhost:19006/workspace/${workspaceId}/page/${documentId}`
  );
});
