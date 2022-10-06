import { test } from "@playwright/test";
import * as sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import { createDocument } from "../../helpers/e2e/createDocument";
import { deleteDocument } from "../../helpers/e2e/deleteDocument";
import { register } from "../../helpers/e2e/register";
import { renameDocument } from "../../helpers/e2e/renameDocument";

const username = `${uuidv4()}@example.com`;
const password = "pass";
const workspaceName = "a workspace";

test.beforeAll(async () => {
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
});
