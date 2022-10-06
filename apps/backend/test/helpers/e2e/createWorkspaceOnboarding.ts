import { expect, Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
  username: string;
  workspaceName: string;
};
export const createWorkspaceOnOnboarding = async ({
  page,
  username,
  workspaceName,
}: Props) => {
  // Fill in the new workspace name
  await page
    .locator(
      'text=Workspace NameThis is the name of your organization, team or private notes. You  >> input[type="text"]'
    )
    .fill(workspaceName);

  // Click the "create" button
  await page.locator('div[role="button"]:has-text("Create")').click();

  await delayForSeconds(5);

  const user = await prisma.user.findFirst({ where: { username } });
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
  const mainDevice = await prisma.device.findFirst({
    where: {
      userId: user?.id,
      signingPublicKey: user?.mainDeviceSigningPublicKey,
    },
  });
  await expect(page).toHaveURL(
    `http://localhost:3000/workspace/${workspaceId}/page/${documentId}`
  );
  return {
    user,
    workspace,
    folder,
    document,
    mainDevice,
  };
};