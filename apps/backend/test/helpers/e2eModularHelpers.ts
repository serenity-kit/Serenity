import { expect, Locator, Page } from "@playwright/test";
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
  await delayForSeconds(2);
  return registerResult;
};

export const moveMouse = async (page: Page) => {
  await page.mouse.move(20, 20, { steps: 1 });
  const viewportSize = page.viewportSize();
  await delayForSeconds(0.5);
  await page.mouse.move(
    viewportSize?.width || 300 - 100,
    viewportSize?.height || 400 - 100,
    { steps: 1 }
  );
};
export const hoverOnElement = async (
  page: Page,
  element: Locator,
  resetMousePosition?: boolean
) => {
  if (resetMousePosition) {
    await moveMouse(page);
  }
  // move cursor
  const elementPosition = await element.boundingBox();
  const elementCenterX =
    elementPosition?.x || 0 + Math.floor(elementPosition?.width || 1 / 1);
  const elementCenterY =
    elementPosition?.y || 0 + Math.floor(elementPosition?.height || 1 / 1);
  await page.mouse.move(elementCenterX, elementCenterY, { steps: 1 });
  await delayForSeconds(0.5);
  await element.hover();
  await delayForSeconds(0.5);
};

export const reloadPage = async (page: Page) => {
  await page.reload();
  await delayForSeconds(2);
};

export const expandFolderTree = async (page: Page, folderId: string) => {
  // 1. locate folder item in sidebar
  const isVisible = await page
    .locator(`data-testid=sidebar-folder--${folderId}`)
    .isVisible();
  // 2. if this folder item is not visible, recursively expand the folder tree to expose it
  if (!isVisible) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId },
    });
    if (folder?.parentFolderId) {
      await expandFolderTree(page, folder.parentFolderId);
    }
    const folderItem = page.locator(`data-testid=sidebar-folder--${folderId}`);
    await hoverOnElement(page, folderItem, true);
    await folderItem.click();
    await delayForSeconds(1);
  }
};

export const openFolderMenu = async (page: Page, folderId: string) => {
  // 1. locate folder item in sidebar
  const folderItem = page.locator(`data-testid=sidebar-folder--${folderId}`);
  const isVisible = await folderItem.isVisible();
  // 2. if this folder item is not visible, let's expand the tree to expose it
  if (!isVisible) {
    await expandFolderTree(page, folderId);
  }
  // 3. Hover over the folder item to display the "..." menu
  await hoverOnElement(page, folderItem, true);
  await delayForSeconds(1);
  // 4. Find the "..." menu and click it
  const menuButton = page.locator(
    `data-testid=sidebar-folder-menu--${folderId}__open`
  );
  const isSubmenuVisible = await menuButton.isVisible();
  if (!isSubmenuVisible) {
    await openFolderMenu(page, folderId);
  }
  await hoverOnElement(page, menuButton, false);
  await delayForSeconds(2);
  await menuButton.click();
  // 5. Wait a second for the UI to update
  await delayForSeconds(2);
};

export const openDocumentMenu = async (page: Page, documentId: string) => {
  const documentItem = page.locator(
    `data-testid=sidebar-document--${documentId}`
  );
  await hoverOnElement(page, documentItem, true);
  const menuButton = page.locator(
    `data-testid=sidebar-document-menu--${documentId}__open`
  );
  await hoverOnElement(page, menuButton, false);
  await menuButton.click();
};

export const renameFolder = async (
  page: Page,
  folderId: string,
  newName: string
) => {
  await openFolderMenu(page, folderId);
  await page
    .locator(`data-testid=sidebar-folder-menu--${folderId}__rename`)
    .click();
  await delayForSeconds(2);
  await page
    .locator(`data-testid=sidebar-folder--${folderId}__edit-name`)
    .fill(newName);
  await page
    .locator(`data-testid=sidebar-folder--${folderId}__edit-name`)
    .press("Enter");
  await delayForSeconds(1);
  const renamedFolderMenu = page.locator(
    `data-testid=sidebar-folder--${folderId}`
  );
  const renamedFolderMenuText = await renamedFolderMenu.textContent();
  expect(renamedFolderMenuText).toBe(newName);
  // TODO: should be added back when sidebar-expantion works
  // await page.reload();
  // await delayForSeconds(3);
  // await openFolderMenu(page, folderId);
  // const renamedFolderMenu1 = page.locator(
  //   `data-testid=sidebar-folder--${folderId}`
  // );
  // const renamedFolderMenuText1 = await renamedFolderMenu1.textContent();
  // expect(renamedFolderMenuText1).toBe(newName);
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
  const deleteMenu = page.locator(
    `[data-testid=sidebar-folder-menu--${folderId}__delete]`
  );
  await hoverOnElement(page, deleteMenu, false);
  await deleteMenu.click();
  await delayForSeconds(2);
  const numFoldersAfterDelete = await prisma.folder.count({
    where: { workspaceId },
  });
  expect(numFoldersAfterDelete).toBe(numFoldersBeforeDelete - 1);
  const isFolderItemVisible = await page
    .locator(`data-testid=sidebar-folder--${folderId}`)
    .isVisible();
  expect(isFolderItemVisible).toBe(false);
  // TODO: should be added back when sidebar-expantion works
  // await page.reload();
  // await delayForSeconds(3);
  // await openFolderMenu(page, folderId);
  // const isFolderItemVisible1 = await page
  //   .locator(`data-testid=sidebar-folder--${folderId}`)
  //   .isVisible();
  // expect(isFolderItemVisible1).toBe(false);
};

export const createSubFolder = async (
  page: Page,
  parentFolderId: string,
  workspaceId: string
) => {
  const numFoldersBeforeAdd = await prisma.folder.count({
    where: { workspaceId },
  });
  await openFolderMenu(page, parentFolderId);
  await page
    .locator(
      `[data-testid=sidebar-folder-menu--${parentFolderId}__create-subfolder]`
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
  const newFolderMenu = page.locator(
    `data-testid=sidebar-folder--${folder?.id}`
  );
  expect(newFolderMenu).not.toBe(undefined);
  const newFolderName = await newFolderMenu.textContent();
  expect(newFolderName).toBe("Untitled");
  // TODO: should be added back when sidebar-expantion works
  // await page.reload();
  // await delayForSeconds(3);
  // await expandFolderTree(page, parentFolderId);
  // const newFolderMenu1 = page.locator(
  //   `data-testid=sidebar-folder--${folder?.id}`
  // );
  // const newFolderName1 = await newFolderMenu1.textContent();
  // expect(newFolderName1).toBe("Untitled");
  return folder;
};

export const createRootFolder = async (
  page: Page,
  name: string,
  workspaceId: string
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
  expect(numFoldersAfterAdd).toEqual(numFoldersBeforeAdd + 1);
  const folder = await prisma.folder.findFirst({
    where: { workspaceId: workspaceId },
    orderBy: { createdAt: "desc" },
  });
  expect(folder).not.toBe(null);
  expect(folder?.parentFolderId).toBe(null);
  const folderItem = page.locator(`data-testid=sidebar-folder--${folder?.id}`);
  const folderItemText = await folderItem.textContent();
  expect(folderItemText).toBe(name);
  // TODO: should be added back when sidebar-expantion works
  // await page.reload();
  // await delayForSeconds(2);
  // const folderItem1 = page.locator(`data-testid=sidebar-folder--${folder?.id}`);
  // const folderItemText1 = await folderItem1.textContent();
  // expect(folderItemText1).toBe(name);
  return folder;
};

export const createDocument = async (
  page: Page,
  parentFolderId: string,
  workspaceId: string
) => {
  const numDocumentsBeforeAdd = await prisma.document.count({
    where: { workspaceId, parentFolderId },
  });
  const folderItem = page.locator(
    `data-testid=sidebar-folder--${parentFolderId}`
  );
  await hoverOnElement(page, folderItem, true);
  await expandFolderTree(page, parentFolderId);
  let createDocumentButton = page.locator(
    `data-testid=sidebar-folder--${parentFolderId}__create-document`
  );
  await hoverOnElement(page, createDocumentButton, false);
  await createDocumentButton.click();
  await delayForSeconds(2);
  const numDocumentsAfterAdd = await prisma.document.count({
    where: { workspaceId, parentFolderId },
  });
  expect(numDocumentsAfterAdd).toBe(numDocumentsBeforeAdd + 1);
  const document = await prisma.document.findFirst({
    where: { workspaceId, parentFolderId },
    orderBy: { createdAt: "desc" },
  });
  expect(document).not.toBe(null);
  await delayForSeconds(1);
  const newDocumentItem = page.locator(
    `data-testid=sidebar-document--${document?.id}`
  );
  const newDocumentName = await newDocumentItem.textContent();
  expect(newDocumentName).toBe("Untitled");
  // TODO: should be added back when sidebar-expantion works
  // await page.reload();
  // await delayForSeconds(3);
  // await expandFolderTree(page, parentFolderId);
  // const newDocumentItem1 = page.locator(
  //   `data-testid=sidebar-document--${document?.id}`
  // );
  // const newDocumentName1 = await newDocumentItem1.textContent();
  // expect(newDocumentName1).toBe("Untitled");
  return document;
};

export const renameDocument = async (
  page: Page,
  documentId: string,
  newName: string
) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId },
  });
  expect(document).not.toBe(null);
  const parentFolder = await prisma.folder.findFirst({
    where: { id: document?.parentFolderId! },
  });
  expect(parentFolder).not.toBe(null);
  await expandFolderTree(page, parentFolder?.id!);
  await openDocumentMenu(page, documentId);
  await page
    .locator(`data-testid=sidebar-document-menu--${documentId}__rename`)
    .click();
  // await delayForSeconds(2);
  await page
    .locator(`data-testid=sidebar-document--${documentId}__edit-name`)
    .fill(newName);
  await page
    .locator(`data-testid=sidebar-document--${documentId}__edit-name`)
    .press("Enter");
  await delayForSeconds(1);
  const renamedDocumentMenu = page.locator(
    `data-testid=sidebar-document--${documentId}`
  );
  const renamedFolderMenuText = await renamedDocumentMenu.textContent();
  expect(renamedFolderMenuText).toBe(newName);
  // TODO: should be added back when sidebar-expantion works
  // await page.reload();
  // await delayForSeconds(3);
  // await expandFolderTree(page, parentFolder?.id!);
  // const renamedDocumentMenu1 = page.locator(
  //   `data-testid=sidebar-document--${documentId}`
  // );
  // const renamedFolderMenuText1 = await renamedDocumentMenu1.textContent();
  // expect(renamedFolderMenuText1).toBe(newName);
};

export const deleteDocument = async (
  page: Page,
  documentId: string,
  workspaceId: string
) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId },
  });
  expect(document).not.toBe(null);
  const parentFolder = await prisma.folder.findFirst({
    where: { id: document?.parentFolderId! },
  });
  expect(parentFolder).not.toBe(null);
  await expandFolderTree(page, parentFolder?.id!);
  await openDocumentMenu(page, documentId);
  const numDocumentsBeforeDelete = await prisma.document.count({
    where: { workspaceId },
  });
  await page
    .locator(`[data-testid=sidebar-document-menu--${documentId}__delete]`)
    .click();
  await delayForSeconds(2);
  const numDocumentsAfterDelete = await prisma.document.count({
    where: { workspaceId },
  });
  expect(numDocumentsAfterDelete).toBe(numDocumentsBeforeDelete - 1);
  const isDocumentItemVisible = await page
    .locator(`data-testid=sidebar-folder--${documentId}`)
    .isVisible();
  expect(isDocumentItemVisible).toBe(false);
  // TODO: should be added back when sidebar-expantion works
  // await page.reload();
  // await delayForSeconds(3);
  // await expandFolderTree(page, parentFolder?.id!);
  // const isDocumentItemVisible2 = await page
  //   .locator(`data-testid=sidebar-folder--${documentId}`)
  //   .isVisible();
  // expect(isDocumentItemVisible2).toBe(false);
};
