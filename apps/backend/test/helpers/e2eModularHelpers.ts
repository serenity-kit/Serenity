import { Page } from "@playwright/test";
import { decryptFolderName } from "@serenity-tools/common";
import { prisma } from "../../src/database/prisma";
import { e2eLoginUser } from "./authentication/e2eLoginUser";
import { e2eRegisterUser } from "./authentication/e2eRegisterUser";
import { delayForSeconds } from "./delayForSeconds";

export const login = async (
  page: Page,
  username: string,
  password: string,
  stayLoggedIn?: boolean
) => {
  await page.goto("http://localhost:3000/login");
  await e2eLoginUser({ page, username, password, stayLoggedIn });
  await delayForSeconds(2);
};

export const register = async (
  page: Page,
  username: string,
  password: string,
  workspaceName: string
) => {
  await page.goto("http://localhost:3000/register");
  const registerResult = await e2eRegisterUser({
    page,
    username,
    password,
    workspaceName,
  });
  expect(registerResult).not.toBe(undefined);
  await delayForSeconds(1);
  return registerResult;
};

export const reloadPage = async (page: Page) => {
  await page.reload();
  await delayForSeconds(2);
};

export const openFolderMenu = async (page: Page, folderId: string) => {
  await page.locator(`data-testid=sidebar-folder-${folderId}`).hover();
  const menuButton = page.locator(
    `data-testid=sidebar-folder-menu__${folderId}--open`
  );
  await menuButton.hover();
  await menuButton.click();
};

export const expandFolderTree = async (page: Page, folderId: string) => {
  await page.locator(`data-testid=sidebar-folder-${folderId}`).click();
};

export const renameFolder = async (
  page: Page,
  folderId: string,
  newName: string,
  workspaceId: string,
  workspaceKey: string
) => {
  await openFolderMenu(page, folderId);
  await page
    .locator(`data-testid=sidebar-folder-menu__${folderId}--rename`)
    .click();
  // await delayForSeconds(2);
  await page
    .locator(`data-testid=sidebar-folder-${folderId}__edit-name`)
    .fill(newName);
  await page
    .locator(`data-testid=sidebar-folder-${folderId}__edit-name`)
    .press("Enter");
  await delayForSeconds(1);
  const renamedFolderMenu = page.locator(
    `data-testid=sidebar-folder-${folderId}`
  );
  expect(renamedFolderMenu).not.toBe(undefined);
  const renamedFolderMenuText = await renamedFolderMenu.textContent();
  console.log({ renamedFolderMenuText });
  expect(renamedFolderMenuText).toBe(newName);

  const folder = await prisma.folder.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
  expect(folder).not.toBe(null);
  const decryptedFolderName = await decryptFolderName({
    parentKey: workspaceKey,
    subkeyId: folder?.subkeyId!,
    ciphertext: folder?.encryptedName!,
    publicNonce: folder?.encryptedNameNonce!,
    publicData: null,
  });
  expect(decryptedFolderName).toBe(newName);
};

export const deleteFolder = async (
  page: Page,
  folderId: string,
  workspaceId: string
) => {
  const numFoldersBeforeDelete = await prisma.folder.count({
    where: { workspaceId },
  });
  await openFolderMenu(page, folderId);
  await page
    .locator(`[data-testid=sidebar-folder-menu__${folderId}--delete]`)
    .click();
  await delayForSeconds(2);

  const numFoldersAfterDelete = await prisma.folder.count({
    where: { workspaceId },
  });
  expect(numFoldersAfterDelete).toBe(numFoldersBeforeDelete - 1);
  const isFolderItemVisible = await page
    .locator(`data-testid=sidebar-folder-${folderId}`)
    .isVisible();
  expect(isFolderItemVisible).toBe(false);
};

export const createSubFolder = async (
  page: Page,
  parentFolderId: string,
  workspaceId: string,
  workspaceKey: string
) => {
  const numFoldersBeforeAdd = await prisma.folder.count({
    where: { workspaceId },
  });
  await openFolderMenu(page, parentFolderId);
  await page
    .locator(
      `[data-testid=sidebar-folder-menu__${parentFolderId}--create-subfolder]`
    )
    .click();
  await delayForSeconds(2);
  const numFoldersAfterAdd = await prisma.folder.count({
    where: { workspaceId },
  });
  expect(numFoldersAfterAdd).toBe(numFoldersBeforeAdd + 1);
  const folder = await prisma.folder.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
  expect(folder).not.toBe(null);
  expect(folder?.parentFolderId).toBe(parentFolderId);
  const decryptedFolderName = await decryptFolderName({
    parentKey: workspaceKey,
    subkeyId: folder?.subkeyId!,
    ciphertext: folder?.encryptedName!,
    publicNonce: folder?.encryptedNameNonce!,
    publicData: null,
  });
  expect(decryptedFolderName).toBe("Untitled");
  return folder;
};

export const createRootFolder = async (
  page: Page,
  name: string,
  workspaceId: string,
  workspaceKey: string
) => {
  const numFoldersBeforeAdd = await prisma.folder.count({
    where: { workspaceId },
  });
  await page.locator("data-testid=root-create-folder").click();
  await page.locator(`data-testid=sidebar-folder__edit-name`).fill(name);
  await page.locator(`data-testid=sidebar-folder__edit-name`).press("Enter");
  await delayForSeconds(2);
  const numFoldersAfterAdd = await prisma.folder.count({
    where: { workspaceId },
  });
  expect(numFoldersAfterAdd).toBe(numFoldersBeforeAdd + 1);
  const folder = await prisma.folder.findFirst({
    where: { workspaceId: workspaceId },
    orderBy: { createdAt: "desc" },
  });
  expect(folder).not.toBe(null);
  expect(folder?.parentFolderId).toBe(null);
  console.log({ folder });
  const decryptedFolderName = await decryptFolderName({
    parentKey: workspaceKey,
    subkeyId: folder?.subkeyId!,
    ciphertext: folder?.encryptedName!,
    publicNonce: folder?.encryptedNameNonce!,
    publicData: null,
  });
  expect(decryptedFolderName).toBe(name);
  console.log({ decryptedFolderName });
  const folderItem = page.locator(`data-testid=sidebar-folder-${folder?.id}`);
  const folderItemText = await folderItem.textContent();
  console.log({ folderItemText });
  expect(folderItemText).toBe(name);
};

export const testCreateRootFolder = async (
  page: Page,
  folderName: string,
  workspaceId: string,
  workspaceKey: string
) => {
  await createRootFolder(page, folderName, workspaceId, workspaceKey);
  const newFolderItem = page.locator("text=New folder");
  expect(newFolderItem).not.toBe(undefined);
  const folder = await prisma.folder.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
  expect(folder).not.toBe(null);
  const decryptedFolderName = await decryptFolderName({
    parentKey: workspaceKey,
    subkeyId: folder?.subkeyId!,
    ciphertext: folder?.encryptedName!,
    publicNonce: folder?.encryptedNameNonce!,
    publicData: null,
  });
  expect(decryptedFolderName).toBe(folderName);
  return folder;
};
