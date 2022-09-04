import { test } from "@playwright/test";
import * as sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { decryptWorkspaceKey } from "../../helpers/device/decryptWorkspaceKey";
import {
  createRootFolder,
  createSubFolder,
  deleteFolder,
  login,
  register,
  reloadPage,
  renameFolder,
} from "../../helpers/e2eModularHelpers";

const userId = uuidv4();
const username = `${uuidv4()}@example.com`;
const password = "pass";
const workspaceName = "a workspace";
let createdWorkspace: any = null;
let workspaceId = "";
let workspaceKey = "";
let firstFolder: any = null;
let firstDocument: any = null;

test.beforeAll(async () => {
  await sodium.ready;
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
  const createFolderUsername = `${uuidv4()}@test.com`;
  test.describe("After registration", () => {
    test("Create, rename, delet root folder", async ({ page }) => {
      const { workspace } = await register(
        page,
        createFolderUsername,
        password,
        workspaceName
      );
      const addedFolder = await createRootFolder(
        page,
        "Test folder",
        workspace?.id!
      );
      await renameFolder(page, addedFolder?.id!, "Renamed folder");
      await deleteFolder(page, addedFolder?.id!, workspace?.id!);
    });
  });
  test.describe("After login", () => {
    test("Create, rename, delete root folder", async ({ page }) => {
      await login(page, username, password);
      const addedFolder = await createRootFolder(
        page,
        "Test folder",
        createdWorkspace.id
      );
      await renameFolder(page, addedFolder?.id!, "Renamed folder");
      await deleteFolder(page, addedFolder?.id!, createdWorkspace.id);
    });
  });
  test.describe("After ephemeral login", () => {
    test("Create, rename, delete root folder", async ({ page }) => {
      await login(page, username, password, false);
      const addedFolder = await createRootFolder(
        page,
        "Test folder",
        createdWorkspace.id
      );
      await renameFolder(page, addedFolder?.id!, "Renamed folder");
      await deleteFolder(page, addedFolder?.id!, createdWorkspace.id);
    });
  });

  test.describe("After reload", () => {
    test("Create, rename, delete root folder", async ({ page }) => {
      await login(page, username, password);
      await reloadPage(page);
      const addedFolder = await createRootFolder(
        page,
        "Test folder",
        createdWorkspace.id
      );
      await renameFolder(page, addedFolder?.id!, "Renamed folder");
      await deleteFolder(page, addedFolder?.id!, createdWorkspace.id);
    });
  });
});

test.describe("Subfolders", () => {
  test.describe("After registration", () => {
    test("Create, rename, delete a subfolder", async ({ page }) => {
      const createFolderUsername = `${uuidv4()}@test.com`;
      const { workspace, folder } = await register(
        page,
        createFolderUsername,
        password,
        workspaceName
      );
      const addedSubfolder = await createSubFolder(
        page,
        folder?.id!,
        workspace?.id!
      );
      await renameFolder(page, addedSubfolder?.id!, "Renamed subfolder");
      await deleteFolder(page, addedSubfolder?.id!, workspace?.id!);
    });
  });
  test.describe("After login", () => {
    test("Create, rename, delete a subfolder", async ({ page }) => {
      await login(page, username, password);
      const addedSubfolder = await createSubFolder(
        page,
        firstFolder.id,
        createdWorkspace.id
      );
      await renameFolder(page, addedSubfolder?.id!, "Renamed subfolder");
      await deleteFolder(page, addedSubfolder?.id!, createdWorkspace.id);
    });
  });

  test.describe("After ephemeral login", () => {
    test("Create, rename, delete a subfolder", async ({ page }) => {
      await login(page, username, password, false);
      const addedSubfolder = await createSubFolder(
        page,
        firstFolder.id,
        createdWorkspace.id
      );
      await renameFolder(page, addedSubfolder?.id!, "Renamed subfolder");
      await deleteFolder(page, addedSubfolder?.id!, createdWorkspace.id);
    });
  });

  test.describe("After refresh", () => {
    test("Create a subfolder", async ({ page }) => {
      await login(page, username, password);
      await reloadPage(page);
      const addedSubfolder = await createSubFolder(
        page,
        firstFolder.id,
        createdWorkspace.id
      );
      await renameFolder(page, addedSubfolder?.id!, "Renamed subfolder");
      await deleteFolder(page, addedSubfolder?.id!, createdWorkspace.id);
    });
  });
});
