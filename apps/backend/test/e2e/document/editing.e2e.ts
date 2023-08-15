import { expect, test } from "@playwright/test";
import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { acceptWorkspaceInvitation } from "../../helpers/e2e/acceptWorkspaceInvitation";
import { createDocument } from "../../helpers/e2e/createDocument";
import { createSubFolder } from "../../helpers/e2e/createSubFolder";
import { createWorkspaceInvitation } from "../../helpers/e2e/createWorkspaceInvitation";
import { e2eLoginUser } from "../../helpers/e2e/e2eLoginUser";
import { login } from "../../helpers/e2e/login";
import { logout } from "../../helpers/e2e/logout";
import { reloadPage } from "../../helpers/e2e/reloadPage";

type UserData = {
  username: string;
  password: string;
  data: any;
};
let user1: UserData;
let user2: UserData;

test.beforeAll(async () => {
  await sodium.ready;
  user1 = {
    username: `${generateId()}@example.com`,
    password: "password",
    data: undefined,
  };
  user2 = {
    username: `${generateId()}@example.com`,
    password: "password",
    data: undefined,
  };
  user1.data = await createUserWithWorkspace({
    username: user1.username,
    password: user1.password,
  });
  user2.data = await createUserWithWorkspace({
    username: user2.username,
    password: user2.password,
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
    await logout({
      page,
      password: user1.password,
      throwIfPasswordVerifyNotOpen: true,
    });
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
    const workspaceInvitationResult = await createWorkspaceInvitation({ page });
    const workspaceInvitationUrl = workspaceInvitationResult.url;
    await page.goBack();
    await page.goBack();
    const user2Context = await browser.newContext();
    const user2Page = await user2Context.newPage();
    await user2Page.goto("http://localhost:19006/login");
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
      password: user2.password,
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
    await logout({
      page,
      password: user1.password,
      throwIfPasswordVerifyNotOpen: true,
    });
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });

    await logout({
      page: user2Page,
      password: user2.password,
      throwIfPasswordVerifyNotOpen: true,
    });
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

test.describe("Edit document in subfolder", () => {
  test("Add content", async ({ page }) => {
    const newContent = "\nHello World!";
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });
    const folder = await createSubFolder(
      page,
      user1.data.folder.id,
      user1.data.workspace.id
    );
    if (!folder) {
      throw new Error("Could not create folder");
    }
    await createDocument(page, folder.id, user1.data.workspace.id);
    const editor = page.locator("div[class='ProseMirror']");
    const startingContent = await editor.innerHTML();
    await page.type("div[class='ProseMirror']", newContent);
    await delayForSeconds(2);
    await reloadPage({ page });
    await delayForSeconds(2);
    const endingContent = await editor.innerHTML();
    expect(startingContent).not.toBe(endingContent);
    await logout({
      page,
      password: user1.password,
      throwIfPasswordVerifyNotOpen: true,
    });
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
    const user2Context = await browser.newContext();
    const user2Page = await user2Context.newPage();
    await user2Page.goto("http://localhost:19006/login");
    await e2eLoginUser({
      page: user2Page,
      username: user2.username,
      password: user2.password,
      stayLoggedIn: false,
    });
    await user2Page.goto(page.url());
    await delayForSeconds(2);
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
    console.log("check");
    await delayForSeconds(30);
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
    await logout({
      page,
      password: user1.password,
      throwIfPasswordVerifyNotOpen: true,
    });
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });

    await logout({
      page: user2Page,
      password: user2.password,
      throwIfPasswordVerifyNotOpen: true,
    });
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
