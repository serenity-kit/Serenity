import { test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { decryptWorkspaceKey } from "../../helpers/device/decryptWorkspaceKey";
import {
  createDocument,
  deleteDocument,
  expandFolderTree,
  login,
  register,
  reloadPage,
  renameDocument,
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

test.describe.skip("Documents", () => {
  let addedDocument: any = null;
  const createDocumentUsername = `${uuidv4()}@test.com`;
  const renameDocumentUsername = `${uuidv4()}@test.com`;
  const deleteDocumentUsername = `${uuidv4()}@test.com`;
  test.describe("After register", () => {
    test("Create document", async ({ page }) => {
      const { workspace, folder } = await register(
        page,
        createDocumentUsername,
        password,
        workspaceName
      );
      // NOTE: we must toggle the open folder to work around the folder expansion bug
      expandFolderTree(page, folder?.id!);
      addedDocument = await createDocument(page, folder?.id!, workspace?.id!);
    });
    test("Rename document", async ({ page }) => {
      const { folder, document } = await register(
        page,
        renameDocumentUsername,
        password,
        workspaceName
      );
      expandFolderTree(page, folder?.id!);
      await renameDocument(page, document?.id!, "Renamed document");
    });

    test("Delete document", async ({ page }) => {
      const { folder, document, workspace } = await register(
        page,
        deleteDocumentUsername,
        password,
        workspaceName
      );
      expandFolderTree(page, folder?.id!);
      await deleteDocument(page, document?.id!, workspace?.id!);
    });
  });
  test.describe("After login", () => {
    test("Create document", async ({ page }) => {
      await login(page, username, password);
      addedDocument = await createDocument(
        page,
        firstFolder.id,
        createdWorkspace.id
      );
    });
    test("Rename document", async ({ page }) => {
      await login(page, username, password);
      await renameDocument(page, addedDocument.id, "Renamed document");
    });

    test("Delete document", async ({ page }) => {
      await login(page, username, password);
      await deleteDocument(page, addedDocument.id, workspaceId);
    });
  });
  test.describe("After ephemeral login", () => {
    test("Create document", async ({ page }) => {
      await login(page, username, password, false);
      addedDocument = await createDocument(
        page,
        firstFolder.id,
        createdWorkspace.id
      );
    });
    test("Rename document", async ({ page }) => {
      await login(page, username, password, false);
      await renameDocument(page, addedDocument.id, "Renamed document");
    });

    test("Delete document", async ({ page }) => {
      await login(page, username, password, false);
      await deleteDocument(page, addedDocument.id, workspaceId);
    });
  });
  test.describe("After reload", () => {
    test("Create document", async ({ page }) => {
      await login(page, username, password, false);
      await reloadPage(page);
      addedDocument = await createDocument(
        page,
        firstFolder.id,
        createdWorkspace.id
      );
    });
    test("Rename document", async ({ page }) => {
      await login(page, username, password, false);
      await reloadPage(page);
      await renameDocument(page, addedDocument.id, "Renamed document");
    });

    test("Delete document", async ({ page }) => {
      await login(page, username, password, false);
      await reloadPage(page);
      await deleteDocument(page, addedDocument.id, workspaceId);
    });
  });
});
