import { test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { decryptWorkspaceKey } from "../../helpers/device/decryptWorkspaceKey";
import {
  createRootFolder,
  createSubFolder,
  deleteFolder,
  expandFolderTree,
  login,
  register,
  reloadPage,
  renameFolder,
} from "../../helpers/e2eModularHelpers";

const userId = uuidv4();
const username = "a@a.com";
const password = "pass";
const workspaceName = "a workspace";
let createdWorkspace: any = null;
let workspaceId = "";
let workspaceKey = "";
let firstFolder: any = null;
let firstDocument: any = null;

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
      const { workspace } = await register(
        page,
        createFolderUsername,
        password,
        workspaceName
      );
      addedFolder = await createRootFolder(page, "Test folder", workspace?.id!);
    });
    test("Rename root folder", async ({ page }) => {
      const { folder } = await register(
        page,
        renameFolderUsername,
        password,
        workspaceName
      );
      await renameFolder(page, folder?.id!, "Renamed folder");
    });

    test("Delete a root folder", async ({ page }) => {
      const { workspace, folder } = await register(
        page,
        deleteFolderUsername,
        password,
        workspaceName
      );
      await deleteFolder(page, folder?.id!, workspace?.id!);
    });
  });
  test.describe("After login", () => {
    test("Create root folder", async ({ page }) => {
      await login(page, username, password);
      addedFolder = await createRootFolder(page, "Test folder", workspaceId);
    });
    test("Rename root folder", async ({ page }) => {
      await login(page, username, password);

      await renameFolder(page, addedFolder.id, "Renamed folder");
    });

    test("Delete a root folder", async ({ page }) => {
      await login(page, username, password);
      await deleteFolder(page, addedFolder.id, workspaceId);
    });
  });
  test.describe("After ephemeral login", () => {
    test("Create root folder", async ({ page }) => {
      await login(page, username, password, false);
      addedFolder = await createRootFolder(page, "Test folder", workspaceId);
    });
    test("Rename root folder", async ({ page }) => {
      await login(page, username, password, false);
      await renameFolder(page, addedFolder.id, "Renamed folder");
    });

    test("Delete a root folder", async ({ page }) => {
      await login(page, username, password, false);
      await deleteFolder(page, addedFolder.id, workspaceId);
    });
  });

  test.describe("After reload", () => {
    test("Create root folder", async ({ page }) => {
      await login(page, username, password);
      await reloadPage(page);
      addedFolder = await createRootFolder(page, "Test folder", workspaceId);
    });
    test("Rename root folder", async ({ page }) => {
      await login(page, username, password);
      await reloadPage(page);
      await renameFolder(page, addedFolder.id, "Renamed folder");
    });

    test("Delete a root folder", async ({ page }) => {
      await login(page, username, password);
      await reloadPage(page);
      await deleteFolder(page, addedFolder.id, workspaceId);
    });
  });
});

test.describe("Subfolders", () => {
  // test.describe("After registration", () => {
  //   let addedSubfolder: any = null;

  //   test("Create a subfolder", async ({ page }) => {
  //     const { workspace } = await register(
  //       page,
  //       username,
  //       password,
  //       workspaceName
  //     );
  //     addedSubfolder = await createSubFolder(
  //       page,
  //       firstFolder.id,
  //       workspace?.id!,
  //       workspaceKey
  //     );
  //   });

  //   test("Rename a subfolder", async ({ page }) => {
  //     const { workspace } = await register(
  //       page,
  //       username,
  //       password,
  //       workspaceName
  //     );
  //     const isSubfolderVisible = await page
  //       .locator(`data-testid=sidebar-folder-${addedSubfolder.id}`)
  //       .isVisible();
  //     if (!isSubfolderVisible) {
  //       await expandFolderTree(page, firstFolder.id);
  //     }
  //     await renameFolder(
  //       page,
  //       addedSubfolder.id,
  //       "Renamed subfolder",
  //       workspace?.id!,
  //       workspaceKey
  //     );
  //   });

  //   test("Delete a folder", async ({ page }) => {
  //     const { workspace } = await register(
  //       page,
  //       username,
  //       password,
  //       workspaceName
  //     );
  //     const isSubfolderVisible = await page
  //       .locator(`data-testid=sidebar-folder-${addedSubfolder.id}`)
  //       .isVisible();
  //     if (!isSubfolderVisible) {
  //       await expandFolderTree(page, firstFolder.id);
  //     }
  //     await deleteFolder(page, addedSubfolder.id, workspace?.id!);
  //   });
  // });
  test.describe("After login", () => {
    let addedSubfolder: any = null;

    test("Create a subfolder", async ({ page }) => {
      await login(page, username, password);
      addedSubfolder = await createSubFolder(page, firstFolder.id, workspaceId);
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
      await deleteFolder(page, addedSubfolder.id, workspaceId);
    });
  });

  test.describe("After ephemeral login", () => {
    let addedSubfolder: any = null;

    test("Create a subfolder", async ({ page }) => {
      await login(page, username, password, false);
      addedSubfolder = await createSubFolder(page, firstFolder.id, workspaceId);
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
      await deleteFolder(page, addedSubfolder.id, workspaceId);
    });
  });

  test.describe("After refresh", () => {
    let addedSubfolder: any = null;

    test("Create a subfolder", async ({ page }) => {
      await login(page, username, password);
      await reloadPage(page);
      addedSubfolder = await createSubFolder(page, firstFolder.id, workspaceId);
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
      await deleteFolder(page, addedSubfolder.id, workspaceId);
    });
  });
});
