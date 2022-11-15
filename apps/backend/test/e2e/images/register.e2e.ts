import { test } from "@playwright/test";
import * as sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import { createDocument } from "../../helpers/e2e/createDocument";
import { createSubFolder } from "../../helpers/e2e/createSubFolder";
import { deleteDocument } from "../../helpers/e2e/deleteDocument";
import { register } from "../../helpers/e2e/register";
import { renameDocument } from "../../helpers/e2e/renameDocument";
import { uploadImage } from "../../helpers/e2e/uploadImage";

const username = `${uuidv4()}@example.com`;
const password = "pass";
const workspaceName = "a workspace";

test.beforeAll(async () => {
  await sodium.ready;
});

test.describe("After register", () => {
  test.only("Upload, remove image", async ({ page }) => {
    const { workspace, folder } = await register({
      page,
      username,
      password,
      workspaceName,
    });
    const numImages = await uploadImage({
      page,
      filePath: "/Users/adonis/Downloads/whatsapp-logo.png",
    });
  });

  test("Create, rename, delete document in subfolder", async ({ page }) => {
    const { workspace, folder } = await register({
      page,
      username: `${uuidv4()}@example.com`,
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
