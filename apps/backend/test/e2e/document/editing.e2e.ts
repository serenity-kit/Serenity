import { expect, test } from "@playwright/test";
import * as sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { acceptWorkspaceInvitation } from "../../helpers/e2e/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../helpers/e2e/createWorkspaceInvitation";
import { e2eLoginUser } from "../../helpers/e2e/e2eLoginUser";
import { login } from "../../helpers/e2e/login";
import { logout } from "../../helpers/e2e/logout";
import { reloadPage } from "../../helpers/e2e/reloadPage";

type UserData = {
  id: string;
  username: string;
  password: string;
  data: any;
};
const user1: UserData = {
  id: uuidv4(),
  username: `${uuidv4()}@example.com`,
  password: "password",
  data: undefined,
};
const user2: UserData = {
  id: uuidv4(),
  username: `${uuidv4()}@example.com`,
  password: "password",
  data: undefined,
};

test.beforeAll(async () => {
  await sodium.ready;
  user1.data = await createUserWithWorkspace({
    id: user1.id,
    username: user1.username,
    password: user1.password,
  });
});

test.describe("Edit document", () => {
  test("Add content", async ({ page }) => {
    const newContent = "\nHello World!";
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });
    const editor = page.locator("div[class='ProseMirror']");
    const startingContent = await editor.innerHTML();
    await page.type("div[class='ProseMirror']", newContent);
    await delayForSeconds(2);
    await reloadPage({ page });
    await delayForSeconds(2);
    const endingContent = await editor.innerHTML();
    expect(startingContent).not.toBe(endingContent);
    await logout({ page });
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });
    await delayForSeconds(2); // wait a bit until the editor loads
    const editorAfterLogin = page.locator("div[class='ProseMirror']");
    const afterLoginContent = await editorAfterLogin.innerHTML();
    expect(afterLoginContent).toBe(endingContent);
  });

  test("Add content shows for shared user", async ({ browser, page }) => {
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });
    user2.data = await createUserWithWorkspace({
      id: user2.id,
      username: user2.username,
      password: user2.password,
    });
    const workspaceInvitationResult = await createWorkspaceInvitation({ page });
    const workspaceInvitationUrl = workspaceInvitationResult.url;
    await page.goBack();
    await page.goBack();
    const user2Context = await browser.newContext();
    const user2Page = await user2Context.newPage();
    await user2Page.goto("http://localhost:3000/login");
    await e2eLoginUser({
      page: user2Page,
      username: user2.username,
      password: user2.password,
      stayLoggedIn: false,
    });
    await acceptWorkspaceInvitation({
      page: user2Page,
      workspaceInvitationUrl,
      sharedWorkspaceId: user1.data.workspace.id,
    });
    await delayForSeconds(5);
    const user1Url = page.url();
    const user2Url = user2Page.url();
    expect(user1Url).toBe(user2Url);

    const newContent1 = "\nHello User 2!";
    const newContent2 = "\nHello User 1!";
    const user1Editor = page.locator("div[class='ProseMirror']");
    const startingContent = await user1Editor.innerHTML();
    const user2Editor = user2Page.locator("div[class='ProseMirror']");
    const user2StartingContent = await user2Editor.innerHTML();
    expect(startingContent).toBe(user2StartingContent);
    // user1 edits document
    await page.type("div[class='ProseMirror']", newContent1);
    await delayForSeconds(2);
    // expect the cursor to show on user2's page
    const user1Cursor = user2Page.locator(
      "xpath=//span[contains(@class,'collaboration-cursor__caret')]"
    );
    const user1CursorExists = await user1Cursor.isVisible();
    expect(user1CursorExists).toBe(true);
    await reloadPage({ page });
    await delayForSeconds(2);
    const endingContent = await user1Editor.innerHTML();
    expect(startingContent).not.toBe(endingContent);
    // user2 edits document
    await reloadPage({ page: user2Page });
    await delayForSeconds(2);
    const user2EndingContent = await user2Editor.innerHTML();
    expect(endingContent).toBe(user2EndingContent);
    await user2Page.type("div[class='ProseMirror']", newContent2);
    // expect the cursor to show on user1's page
    const user2Cursor = page.locator(
      "xpath=//span[contains(@class,'collaboration-cursor__caret')]"
    );
    const user2CursorExists = await user2Cursor.isVisible();
    expect(user2CursorExists).toBe(true);
    // reload page
    await reloadPage({ page });
    await reloadPage({ page: user2Page });
    // verify content for both users
    const user1EditorAfterReload = page.locator("div[class='ProseMirror']");
    const user1AfterReloadContent = await user1EditorAfterReload.innerHTML();
    const user2EditorAfterReload = page.locator("div[class='ProseMirror']");
    const user2AfterReloadContent = await user2EditorAfterReload.innerHTML();
    expect(user1AfterReloadContent).toBe(user2AfterReloadContent);
    // re-login
    await logout({ page });
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });

    await logout({ page: user2Page });
    await login({
      page: user2Page,
      username: user2.username,
      password: user2.password,
      stayLoggedIn: true,
    });

    const user1EditorAfterLogin = page.locator("div[class='ProseMirror']");
    const user1AfterLoginContent = await user1EditorAfterLogin.innerHTML();
    const user2EditorAfterLogin = page.locator("div[class='ProseMirror']");
    const user2AfterLoginContent = await user2EditorAfterLogin.innerHTML();
    expect(user1AfterLoginContent).toBe(user2AfterLoginContent);
  });
});
