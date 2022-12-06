import { expect, Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { formatDocument } from "../../../src/types/document";
import { formatFolder } from "../../../src/types/folder";
import { delayForSeconds } from "../delayForSeconds";
import { verifyPassword } from "./verifyPassword";

export type Props = {
  page: Page;
  username: string;
  password: string;
  workspaceName: string;
  throwIfVerifyPasswordNotOpen?: boolean;
};
export const createWorkspaceOnOnboarding = async ({
  page,
  username,
  password,
  workspaceName,
  throwIfVerifyPasswordNotOpen,
}: Props) => {
  // Fill in the new workspace name
  await page
    .locator(
      'text=Workspace NameThis is the name of your organization, team or private notes. You  >> input[type="text"]'
    )
    .fill(workspaceName);
  await verifyPassword({
    page,
    password,
    throwIfNotOpen: throwIfVerifyPasswordNotOpen,
  });
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
      workspaceKeys: {
        include: {
          workspaceKeyBoxes: {
            where: { deviceSigningPublicKey: user?.mainDeviceSigningPublicKey },
          },
        },
      },
    },
  });
  expect(workspace).not.toBe(null);
  const workspaceBox = workspace?.workspaceKeys[0].workspaceKeyBoxes[0];
  // a page will have been created
  const document = await prisma.document.findFirst({
    where: { workspaceId },
  });
  expect(document).not.toBe(null);
  const documentId = document?.id;
  await expect(page).toHaveURL(
    `http://localhost:19006/workspace/${workspaceId}/page/${documentId}`
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
    `http://localhost:19006/workspace/${workspaceId}/page/${documentId}`
  );
  const formattedFolder = formatFolder(folder);
  const formattedDocument = formatDocument(document);
  return {
    user,
    workspace,
    folder: formattedFolder,
    document: formattedDocument,
    mainDevice,
  };
};
