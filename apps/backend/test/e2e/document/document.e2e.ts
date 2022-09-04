import { test } from "@playwright/test";
import * as sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { decryptWorkspaceKey } from "../../helpers/device/decryptWorkspaceKey";
import {
  createDocument,
  deleteDocument,
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

test.describe("Documents", () => {
  const createDocumentUsername = `${uuidv4()}@test.com`;
  test.describe("After register", () => {
    test("Create, rename, delete", async ({ page }) => {
      const { workspace, folder } = await register(
        page,
        createDocumentUsername,
        password,
        workspaceName
      );
      const addedDocument = await createDocument(
        page,
        folder?.id!,
        workspace?.id!
      );
      await renameDocument(page, addedDocument?.id!, "Renamed document");
      await deleteDocument(page, addedDocument?.id!, workspace?.id!);
    });
  });
  test.describe("After login", () => {
    test("Create, rename, delete", async ({ page }) => {
      await login(page, username, password);
      const addedDocument = await createDocument(
        page,
        firstFolder.id,
        createdWorkspace.id
      );
      await renameDocument(page, addedDocument?.id!, "Renamed document");
      await deleteDocument(page, addedDocument?.id!, createdWorkspace.id);
    });
  });
  test.describe("After ephemeral login", () => {
    test("Create, rename, delete", async ({ page }) => {
      await login(page, username, password, false);
      const addedDocument = await createDocument(
        page,
        firstFolder.id,
        createdWorkspace.id
      );
      await renameDocument(page, addedDocument?.id!, "Renamed document");
      await deleteDocument(page, addedDocument?.id!, createdWorkspace.id);
    });
  });
  test.describe("After reload", () => {
    test("Create, rename, delete", async ({ page }) => {
      await login(page, username, password, false);
      await reloadPage(page);
      const addedDocument = await createDocument(
        page,
        firstFolder.id,
        createdWorkspace.id
      );
      await renameDocument(page, addedDocument?.id!, "Renamed document");
      await deleteDocument(page, addedDocument?.id!, createdWorkspace.id);
    });
  });
});
