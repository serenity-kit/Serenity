import { generateId } from "@naisho/core";
import { test } from "@playwright/test";
import sodium from "react-native-libsodium";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { createDocument } from "../../helpers/e2e/createDocument";
import { deleteDocument } from "../../helpers/e2e/deleteDocument";
import { login } from "../../helpers/e2e/login";
import { renameDocument } from "../../helpers/e2e/renameDocument";

let userId: string;
let username: string;
const password = "password";
let createdWorkspace: any = null;
let workspaceId = "";
let firstFolder: any = null;

test.beforeAll(async () => {
  await sodium.ready;
  userId = generateId();
  username = `${generateId()}@example.com`;
  const { workspace, folder } = await createUserWithWorkspace({
    id: userId,
    username,
    password,
  });
  createdWorkspace = workspace;
  firstFolder = folder;
  workspaceId = workspace.id;
});

test.describe("After temporary login", () => {
  test("Create, rename, delete document", async ({ page }) => {
    await login({ page, username, password, stayLoggedIn: false });
    const addedDocument = await createDocument(
      page,
      firstFolder.id,
      createdWorkspace.id
    );
    await renameDocument(page, addedDocument?.id!, "Renamed document");
    await deleteDocument(page, addedDocument?.id!, createdWorkspace.id);
  });
});
