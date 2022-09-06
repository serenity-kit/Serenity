import { expect, Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
  username: string;
  password: string;
  workspaceName: string;
};
export const e2eRegisterUser = async ({
  page,
  username,
  password,
  workspaceName,
}: Props) => {
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
      'text=Verify your EmailPlease enter the verification code sent to you via Email.Verifi >> div[role="button"]'
    )
    .click();
  await expect(page).toHaveURL("http://localhost:3000/onboarding");

  // Fill in the new workspace name
  await page
    .locator(
      'text=Workspace NameThis is the name of your organization, team or private notes. You  >> input[type="text"]'
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
    include: {
      workspaceKey: {
        include: {
          workspaceKeyBoxes: {
            where: { deviceSigningPublicKey: user?.mainDeviceSigningPublicKey },
          },
        },
      },
    },
  });
  expect(workspace).not.toBe(null);
  const workspaceBox = workspace?.workspaceKey[0].workspaceKeyBoxes[0];
  // a page will have been created
  const document = await prisma.document.findFirst({
    where: { workspaceId },
  });
  expect(document).not.toBe(null);
  const documentId = document?.id;
  await expect(page).toHaveURL(
    `http://localhost:3000/workspace/${workspaceId}/page/${documentId}`
  );
  const folder = await prisma.folder.findFirst({
    where: { workspaceId },
  });
  const mainDevice = await prisma.device.findUnique({
    where: { signingPublicKey: user?.mainDeviceSigningPublicKey },
  });
  return {
    user,
    workspace,
    folder,
    document,
    mainDevice,
  };
};
