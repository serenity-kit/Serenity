import { expect, test } from "@playwright/test";
import * as sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { login } from "../../helpers/e2e/login";
import { reloadPage } from "../../helpers/e2e/reloadPage";

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

test.describe("Edit document", () => {
  test("Add content", async ({ page }) => {
    const newContent = "\nHello World!";
    await login({ page, username, password, stayLoggedIn: true });
    const editor = page.locator("div[class='ProseMirror']");
    const startingContent = await editor.innerHTML();
    // console.log(startingContent);
    await page.type("div[class='ProseMirror']", newContent);
    await delayForSeconds(2);
    await reloadPage({ page });
    await delayForSeconds(2);
    const endingContent = await editor.innerHTML();
    expect(startingContent).not.toBe(endingContent);
  });
});
