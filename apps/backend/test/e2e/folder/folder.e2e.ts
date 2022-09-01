import { expect, Page, test } from "@playwright/test";
import { decryptFolderName } from "@serenity-tools/common";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../../src/database/prisma";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { e2eLoginUser } from "../../helpers/authentication/e2eLoginUser";
import { e2eRegisterUser } from "../../helpers/authentication/e2eRegisterUser";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { decryptWorkspaceKey } from "../../helpers/device/decryptWorkspaceKey";

const userId = uuidv4();
const username = "a@a.com";
const password = "pass";
const workspaceName = "a workspace";
let createdWorkspace: any = null;
let workspaceId = "";
let workspaceKey = "";
let firstFolder: any = null;
let firstDocument: any = null;

const login = async (
  page: Page,
  username: string,
  password: string,
  stayLoggedIn?: boolean
) => {
  await page.goto("http://localhost:3000/login");
  await e2eLoginUser({ page, username, password, stayLoggedIn });
  await delayForSeconds(2);
};

const register = async (
  page: Page,
  username: string,
  password: string,
  workspaceName: string
) => {
  await page.goto("http://localhost:3000/register");
  await e2eRegisterUser({ page, username, password, workspaceName });
  await delayForSeconds(4);
};

const reloadPage = async (page: Page) => {
  await page.reload();
  await delayForSeconds(2);
};

const openFolderMenu = async (page: Page, folderId: string) => {
  await page.locator(`data-testid=sidebar-folder-${folderId}`).hover();
  const menuButton = page.locator(
    `data-testid=sidebar-folder-menu__${folderId}--open`
  );
  await menuButton.hover();
  await menuButton.click();
};

const expandFolderTree = async (page: Page, folderId: string) => {
  await page.locator(`data-testid=sidebar-folder-${folderId}`).click();
};

const renameFolder = async (page: Page, folderId: string, newName: string) => {
  await openFolderMenu(page, folderId);
  await page
    .locator(`data-testid=sidebar-folder-menu__${folderId}--rename`)
    .click();
  // await delayForSeconds(2);
  await page.locator('input[type="text"]').fill(newName);
  await page.locator('input[type="text"]').press("Enter");
  await delayForSeconds(1);
  const renamedFolderMenu = page.locator(
    `data-testid=sidebar-folder-${folderId}`
  );
  expect(renamedFolderMenu).not.toBe(undefined);
  const renamedFolderMenuText = await renamedFolderMenu.textContent();
  console.log({ renamedFolderMenuText });
  expect(renamedFolderMenuText).toBe(newName);

  const folder = await prisma.folder.findFirst({
    where: { workspaceId: createdWorkspace.id },
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

const deleteFolder = async (page: Page, folderId: string) => {
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

const createSubFolder = async (page: Page, parentFolderId: string) => {
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
    where: { workspaceId: createdWorkspace.id },
    orderBy: { createdAt: "desc" },
  });
  expect(folder).not.toBe(null);
  expect(folder?.parentFolderId).toBe(firstFolder.id);
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

const createRootFolder = async (page: Page, name: string) => {
  const numFoldersBeforeAdd = await prisma.folder.count({
    where: { workspaceId },
  });
  await page.locator("data-testid=root-create-folder").click();
  await page.locator('input[type="text"]').fill(name);
  await page.locator('input[type="text"]').press("Enter");
  await delayForSeconds(2);
  const numFoldersAfterAdd = await prisma.folder.count({
    where: { workspaceId },
  });
  console.log({ numFoldersBeforeAdd, numFoldersAfterAdd });
  expect(numFoldersAfterAdd).toBe(numFoldersBeforeAdd + 1);
  const folder = await prisma.folder.findFirst({
    where: { workspaceId: createdWorkspace.id },
    orderBy: { createdAt: "desc" },
  });
  expect(folder).not.toBe(null);
  expect(folder?.parentFolderId).toBe(null);
  const decryptedFolderName = await decryptFolderName({
    parentKey: workspaceKey,
    subkeyId: folder?.subkeyId!,
    ciphertext: folder?.encryptedName!,
    publicNonce: folder?.encryptedNameNonce!,
    publicData: null,
  });
  expect(decryptedFolderName).toBe(name);
  const folderItem = page.locator(`data-testid=sidebar-folder-${folder?.id}`);
  const folderItemText = await folderItem.textContent();
  expect(folderItemText).toBe(name);
};

const testCreateRootFolder = async (page: Page, folderName: string) => {
  await createRootFolder(page, folderName);
  const newFolderItem = page.locator("text=New folder");
  expect(newFolderItem).not.toBe(undefined);
  const folder = await prisma.folder.findFirst({
    where: { workspaceId: createdWorkspace.id },
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

test.beforeAll(async () => {
  const { workspace, folder, document, device, encryptionPrivateKey } =
    await createUserWithWorkspace({
      id: userId,
      username,
      password,
    });
  createdWorkspace = workspace;
  firstFolder = folder;
  firstDocument = document;
  workspaceId = workspace.id;
  const workspaceBox = workspace.currentWorkspaceKey?.workspaceKeyBox;
  workspaceKey = await decryptWorkspaceKey({
    ciphertext: workspaceBox?.ciphertext!,
    nonce: workspaceBox?.nonce!,
    creatorDeviceEncryptionPublicKey: device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: encryptionPrivateKey,
  });
});

test.describe("Root folders", () => {
  let addedFolder: any = null;
  const createFolderUsername = `${uuidv4()}@test.com`;
  const renameFolderUsername = `${uuidv4()}@test.com`;
  const deleteFolderUsername = `${uuidv4()}@test.com`;
  test.describe("After registration", () => {
    test("Create root folder", async ({ page }) => {
      await register(page, createFolderUsername, password, workspaceName);
      addedFolder = await testCreateRootFolder(page, "Test folder");
    });
    test("Rename root folder", async ({ page }) => {
      await register(page, renameFolderUsername, password, workspaceName);
      await renameFolder(page, addedFolder.id, "Renamed folder");
    });

    test("Delete a root folder", async ({ page }) => {
      await register(page, deleteFolderUsername, password, workspaceName);
      await deleteFolder(page, addedFolder.id);
    });
  });
  test.describe("After login", () => {
    test("Create root folder", async ({ page }) => {
      await login(page, username, password);
      addedFolder = await testCreateRootFolder(page, "Test folder");
    });
    test("Rename root folder", async ({ page }) => {
      await login(page, username, password);
      await renameFolder(page, addedFolder.id, "Renamed folder");
    });

    test("Delete a root folder", async ({ page }) => {
      await login(page, username, password);
      await deleteFolder(page, addedFolder.id);
    });
  });
  test.describe("After ephemeral login", () => {
    test("Create root folder", async ({ page }) => {
      await login(page, username, password, false);
      addedFolder = await testCreateRootFolder(page, "Test folder");
    });
    test("Rename root folder", async ({ page }) => {
      await login(page, username, password, false);
      await renameFolder(page, addedFolder.id, "Renamed folder");
    });

    test("Delete a root folder", async ({ page }) => {
      await login(page, username, password, false);
      await deleteFolder(page, addedFolder.id);
    });
  });

  test.describe("After reload", () => {
    test("Create root folder", async ({ page }) => {
      await login(page, username, password);
      await reloadPage(page);
      addedFolder = await testCreateRootFolder(page, "Test folder");
    });
    test("Rename root folder", async ({ page }) => {
      await login(page, username, password);
      await reloadPage(page);
      await renameFolder(page, addedFolder.id, "Renamed folder");
    });

    test("Delete a root folder", async ({ page }) => {
      await login(page, username, password);
      await reloadPage(page);
      await deleteFolder(page, addedFolder.id);
    });
  });
});

test.describe("Subfolders", () => {
  test.describe("After registration", () => {
    let addedSubfolder: any = null;

    test("Create a subfolder", async ({ page }) => {
      await register(page, username, password, workspaceName);
      addedSubfolder = await createSubFolder(page, firstFolder.id);
    });

    test("Rename a subfolder", async ({ page }) => {
      await register(page, username, password, workspaceName);
      const isSubfolderVisible = await page
        .locator(`data-testid=sidebar-folder-${addedSubfolder.id}`)
        .isVisible();
      if (!isSubfolderVisible) {
        await expandFolderTree(page, firstFolder.id);
      }
      await renameFolder(page, addedSubfolder.id, "Renamed subfolder");
    });

    test("Delete a folder", async ({ page }) => {
      await register(page, username, password, workspaceName);
      const isSubfolderVisible = await page
        .locator(`data-testid=sidebar-folder-${addedSubfolder.id}`)
        .isVisible();
      if (!isSubfolderVisible) {
        await expandFolderTree(page, firstFolder.id);
      }
      await deleteFolder(page, addedSubfolder.id);
    });
  });
  test.describe("After login", () => {
    let addedSubfolder: any = null;

    test("Create a subfolder", async ({ page }) => {
      await login(page, username, password);
      addedSubfolder = await createSubFolder(page, firstFolder.id);
    });

    test("Rename a subfolder", async ({ page }) => {
      await login(page, username, password);
      const isSubfolderVisible = await page
        .locator(`data-testid=sidebar-folder-${addedSubfolder.id}`)
        .isVisible();
      if (!isSubfolderVisible) {
        await expandFolderTree(page, firstFolder.id);
      }
      await renameFolder(page, addedSubfolder.id, "Renamed subfolder");
    });

    test("Delete a folder", async ({ page }) => {
      await login(page, username, password);
      const isSubfolderVisible = await page
        .locator(`data-testid=sidebar-folder-${addedSubfolder.id}`)
        .isVisible();
      if (!isSubfolderVisible) {
        await expandFolderTree(page, firstFolder.id);
      }
      await deleteFolder(page, addedSubfolder.id);
    });
  });

  test.describe("After ephemeral login", () => {
    let addedSubfolder: any = null;

    test("Create a subfolder", async ({ page }) => {
      await login(page, username, password, false);
      addedSubfolder = await createSubFolder(page, firstFolder.id);
    });

    test("Rename a subfolder", async ({ page }) => {
      await login(page, username, password, false);
      const isSubfolderVisible = await page
        .locator(`data-testid=sidebar-folder-${addedSubfolder.id}`)
        .isVisible();
      if (!isSubfolderVisible) {
        await expandFolderTree(page, firstFolder.id);
      }
      await renameFolder(page, addedSubfolder.id, "Renamed subfolder");
    });

    test("Delete a folder", async ({ page }) => {
      await login(page, username, password, false);
      const isSubfolderVisible = await page
        .locator(`data-testid=sidebar-folder-${addedSubfolder.id}`)
        .isVisible();
      if (!isSubfolderVisible) {
        await expandFolderTree(page, firstFolder.id);
      }
      await deleteFolder(page, addedSubfolder.id);
    });
  });

  test.describe("After refresh", () => {
    let addedSubfolder: any = null;

    test("Create a subfolder", async ({ page }) => {
      await login(page, username, password);
      await reloadPage(page);
      addedSubfolder = await createSubFolder(page, firstFolder.id);
    });

    test("Rename a subfolder", async ({ page }) => {
      await login(page, username, password);
      await reloadPage(page);
      const isSubfolderVisible = await page
        .locator(`data-testid=sidebar-folder-${addedSubfolder.id}`)
        .isVisible();
      if (!isSubfolderVisible) {
        await expandFolderTree(page, firstFolder.id);
      }
      await renameFolder(page, addedSubfolder.id, "Renamed subfolder");
    });

    test("Delete a folder", async ({ page }) => {
      await login(page, username, password);
      await reloadPage(page);
      const isSubfolderVisible = await page
        .locator(`data-testid=sidebar-folder-${addedSubfolder.id}`)
        .isVisible();
      if (!isSubfolderVisible) {
        await expandFolderTree(page, firstFolder.id);
      }
      await deleteFolder(page, addedSubfolder.id);
    });
  });
});
