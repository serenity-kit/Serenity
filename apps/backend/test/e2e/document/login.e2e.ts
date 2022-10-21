import { test } from "@playwright/test";
import * as sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { createDocument } from "../../helpers/e2e/createDocument";
import { createSubFolder } from "../../helpers/e2e/createSubFolder";
import { deleteDocument } from "../../helpers/e2e/deleteDocument";
import { login } from "../../helpers/e2e/login";
import { renameDocument } from "../../helpers/e2e/renameDocument";

const userId = uuidv4();
const username = `${uuidv4()}@example.com`;
const password = "pass";
let createdWorkspace: any = null;
let workspaceId = "";
let firstFolder: any = null;

test.beforeAll(async () => {
  await sodium.ready;
  const { workspace, folder } = await createUserWithWorkspace({
    id: userId,
    username,
    password,
  });
  createdWorkspace = workspace;
  firstFolder = folder;
  workspaceId = workspace.id;
});

test.describe("After login", () => {
  test("Create, rename, delete document", async ({ page }) => {
    await login({ page, username, password, stayLoggedIn: true });
    const addedDocument = await createDocument(
      page,
      firstFolder.id,
      createdWorkspace.id
    );
    await renameDocument(page, addedDocument?.id!, "Renamed document");
    await deleteDocument(page, addedDocument?.id!, createdWorkspace.id);
  });

  test("Create, rename, delete document in subfolder", async ({ page }) => {
    await login({ page, username, password, stayLoggedIn: true });
    const addedFolder = await createSubFolder(
      page,
      firstFolder.id,
      createdWorkspace.id
    );
    if (!addedFolder) {
      throw new Error("Folder not found");
    }
    const addedDocument = await createDocument(
      page,
      addedFolder.id,
      createdWorkspace.id
    );
    await renameDocument(page, addedDocument?.id!, "Renamed document");
    await deleteDocument(page, addedDocument?.id!, createdWorkspace.id);
  });
});
