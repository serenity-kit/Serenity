import { test } from "@playwright/test";
import * as sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { createRootFolder } from "../../helpers/e2e/createRootFolder";
import { createSubFolder } from "../../helpers/e2e/createSubFolder";
import { deleteFolder } from "../../helpers/e2e/deleteFolder";
import { login } from "../../helpers/e2e/login";
import { renameFolder } from "../../helpers/e2e/renameFolder";

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

test.describe("After temporary login", () => {
  test("Create, rename, delete root folder", async ({ page }) => {
    await login({ page, username, password, stayLoggedIn: false });
    const addedFolder = await createRootFolder(
      page,
      "Test folder",
      createdWorkspace.id
    );
    await renameFolder(page, addedFolder?.id!, "Renamed folder");
    await deleteFolder(page, addedFolder?.id!, createdWorkspace.id);
  });

  test("Create, rename, delete a subfolder", async ({ page }) => {
    await login({ page, username, password, stayLoggedIn: false });
    const addedSubfolder = await createSubFolder(
      page,
      firstFolder.id,
      createdWorkspace.id
    );
    await renameFolder(page, addedSubfolder?.id!, "Renamed subfolder");
    await deleteFolder(page, addedSubfolder?.id!, createdWorkspace.id);
  });
});
