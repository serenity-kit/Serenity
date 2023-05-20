import { test } from "@playwright/test";
import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { createRootFolder } from "../../helpers/e2e/createRootFolder";
import { createSubFolder } from "../../helpers/e2e/createSubFolder";
import { deleteFolder } from "../../helpers/e2e/deleteFolder";
import { login } from "../../helpers/e2e/login";
import { renameFolder } from "../../helpers/e2e/renameFolder";

const password = "password";

test.beforeAll(async () => {
  await sodium.ready;
});

test.describe("After login", () => {
  test("Create, rename, delete root folder", async ({ page }) => {
    const { user, workspace } = await createUserWithWorkspace({
      id: generateId(),
      username: `${generateId()}@example.com`,
      password,
    });
    const createdWorkspace = workspace;
    await login({
      page,
      username: user.username,
      password,
      stayLoggedIn: true,
    });
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
      id: generateId(),
      username: `${generateId()}@example.com`,
      password,
    });
    const createdWorkspace = workspace;
    const firstFolder = folder;
    await login({
      page,
      username: user.username,
      password,
      stayLoggedIn: true,
    });
    const addedSubfolder = await createSubFolder(
      page,
      firstFolder.id,
      createdWorkspace.id
    );
    await renameFolder(page, addedSubfolder?.id!, "Renamed subfolder");
    await deleteFolder(page, addedSubfolder?.id!, createdWorkspace.id);
  });
});
