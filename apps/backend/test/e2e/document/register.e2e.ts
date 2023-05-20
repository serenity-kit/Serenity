import { test } from "@playwright/test";
import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { createDocument } from "../../helpers/e2e/createDocument";
import { createSubFolder } from "../../helpers/e2e/createSubFolder";
import { deleteDocument } from "../../helpers/e2e/deleteDocument";
import { register } from "../../helpers/e2e/register";
import { renameDocument } from "../../helpers/e2e/renameDocument";

let username: string;
const password = "password";
const workspaceName = "a workspace";

test.beforeAll(async () => {
  username = `${generateId()}@example.com`;

  await sodium.ready;
});

test.describe("After register", () => {
  test("Create, rename, delete document", async ({ page }) => {
    const { workspace, folder } = await register({
      page,
      username,
      password,
      workspaceName,
    });
    const addedDocument = await createDocument(
      page,
      folder?.id!,
      workspace?.id!
    );
    await renameDocument(page, addedDocument?.id!, "Renamed document");
    await deleteDocument(page, addedDocument?.id!, workspace?.id!);
  });

  test("Create, rename, delete document in subfolder", async ({ page }) => {
    const { workspace, folder } = await register({
      page,
      username: `${generateId()}@example.com`,
      password,
      workspaceName,
    });
    const addedFolder = await createSubFolder(
      page,
      folder?.id!,
      workspace?.id!
    );
    if (!addedFolder) {
      throw new Error("Folder not found");
    }
    const addedDocument = await createDocument(
      page,
      addedFolder.id,
      workspace?.id!
    );
    await renameDocument(page, addedDocument?.id!, "Renamed document");
    await deleteDocument(page, addedDocument?.id!, workspace?.id!);
  });
});
