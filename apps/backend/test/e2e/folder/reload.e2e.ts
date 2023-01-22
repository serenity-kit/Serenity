import { test } from "@playwright/test";
import sodium from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { createRootFolder } from "../../helpers/e2e/createRootFolder";
import { createSubFolder } from "../../helpers/e2e/createSubFolder";
import { deleteFolder } from "../../helpers/e2e/deleteFolder";
import { login } from "../../helpers/e2e/login";
import { reloadPage } from "../../helpers/e2e/reloadPage";
import { renameFolder } from "../../helpers/e2e/renameFolder";

const password = "pass";

test.beforeAll(async () => {
  await sodium.ready;
});

test.describe("After reload", () => {
  test("Create, rename, delete root folder", async ({ page }) => {
    const { user, workspace } = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    const createdWorkspace = workspace;
    await login({
      page,
      username: user.username,
      password,
      stayLoggedIn: false,
    });
    await reloadPage({ page });
    const addedFolder = await createRootFolder(
      page,
      "Test folder",
      createdWorkspace.id
    );
    await renameFolder(page, addedFolder?.id!, "Renamed folder");
    await deleteFolder(page, addedFolder?.id!, createdWorkspace.id);
  });

  test("Create, rename, delete a subfolder", async ({ page }) => {
    const { user, workspace, folder } = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    const createdWorkspace = workspace;
    const firstFolder = folder;
    await login({
      page,
      username: user.username,
      password,
      stayLoggedIn: false,
    });
    await reloadPage({ page });
    const addedSubfolder = await createSubFolder(
      page,
      firstFolder.id,
      createdWorkspace.id
    );
    await renameFolder(page, addedSubfolder?.id!, "Renamed subfolder");
    await deleteFolder(page, addedSubfolder?.id!, createdWorkspace.id);
  });
});
