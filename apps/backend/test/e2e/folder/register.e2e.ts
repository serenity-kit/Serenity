import { test } from "@playwright/test";
import * as sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import { createRootFolder } from "../../helpers/e2e/createRootFolder";
import { createSubFolder } from "../../helpers/e2e/createSubFolder";
import { deleteFolder } from "../../helpers/e2e/deleteFolder";
import { register } from "../../helpers/e2e/register";
import { renameFolder } from "../../helpers/e2e/renameFolder";

const password = "pass";
const workspaceName = "a workspace";

test.beforeAll(async () => {
  await sodium.ready;
});

test.describe("After register", () => {
  test("Create, rename, delete root folder", async ({ page }) => {
    const { workspace } = await register(
      page,
      `${uuidv4()}@example.com`,
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

  test("Create, rename, delete sub folder", async ({ page }) => {
    const { workspace, folder } = await register(
      page,
      `${uuidv4()}@example.com`,
      password,
      workspaceName
    );
    const addedFolder = await createSubFolder(
      page,
      folder?.id!,
      workspace?.id!
    );
    await renameFolder(page, addedFolder?.id!, "Renamed folder");
    await deleteFolder(page, addedFolder?.id!, workspace?.id!);
  });
});
