import { expect, Page, test } from "@playwright/test";
import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { Role } from "../../../prisma/generated/output";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { acceptWorkspaceInvitation } from "../../helpers/e2e/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../helpers/e2e/createWorkspaceInvitation";
import { e2eLoginUser } from "../../helpers/e2e/e2eLoginUser";
import { reloadPage } from "../../helpers/e2e/reloadPage";
import { removeMemberFromWorkspace } from "../../helpers/e2e/removeMemberFromWorkspace";
import { renameFolder } from "../../helpers/e2e/renameFolder";

type UserData = {
  username: string;
  password: string;
  data: any;
};
let user1: UserData;
let user2: UserData;
let user3: UserData;

type HasFolderAccessProps = {
  page: Page;
  folderId: string;
  name: string;
};
const hasFolderAccess = async ({
  page,
  folderId,
  name,
}: HasFolderAccessProps) => {
  const folderItem = page.locator(`data-testid=sidebar-folder--${folderId}`);
  const folderItemText = await folderItem.textContent();
  return folderItemText === name;
};

const setup = async () => {
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
  user3 = {
    username: `${generateId()}@example.com`,
    password: "password",
    data: undefined,
  };
  user1.data = await createUserWithWorkspace({ ...user1 });
  user2.data = await createUserWithWorkspace({ ...user2 });
  user3.data = await createUserWithWorkspace({ ...user3 });
  await delayForSeconds(2);
};

test.beforeAll(async () => {
  await sodium.ready;
  await setup();
});

test.describe("Workspace Sharing", () => {
  let workspaceInvitationUrl = "";

  test("User 1 can create a sharing link", async ({ browser, page }) => {
    // const workspaceName = "sharable";
    // await page.goto("http://localhost:19006/register");
    // await registerOnPage({ page, username, password, workspaceName });

    await page.goto("http://localhost:19006/login");
    await e2eLoginUser({
      page,
      username: user1.username,
      password: user1.password,
    });
    await delayForSeconds(2);

    const { url } = await createWorkspaceInvitation({
      page,
      role: Role.EDITOR,
    });
    workspaceInvitationUrl = url;

    // now accept for both users
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
    // await renameFolder(user2Page, user1.data.folder.id, "user2 renamed");

    // can this user read the folders?
    const user3Context = await browser.newContext();
    const user3Page = await user3Context.newPage();
    await user3Page.goto("http://localhost:19006/login");
    await e2eLoginUser({
      page: user3Page,
      username: user3.username,
      password: user3.password,
      stayLoggedIn: false,
    });
    await acceptWorkspaceInvitation({
      page: user3Page,
      workspaceInvitationUrl,
      sharedWorkspaceId: user1.data.workspace.id,
      password: user3.password,
    });
    await delayForSeconds(5);
    // await renameFolder(user3Page, user1.data.folder.id, "user3 renamed");

    // now remove access to user3
    await page.reload();
    await delayForSeconds(2);
    await removeMemberFromWorkspace({
      page,
      userId: user3.data.user.id,
      password: user1.password,
    });
    await delayForSeconds(2);
    await reloadPage({ page: user2Page });
    await reloadPage({ page: user3Page });
    await delayForSeconds(4);
    const user3Url = user3Page.url();
    const expectedUser3Url = `http://localhost:19006/workspace/${user1.data.workspace.id}/not-found`;
    const invalidAccessMessage = user3Page.locator(
      "data-testid=no-access-to-workspace-error"
    );
    const doesInvalidAccessMessageExist =
      await invalidAccessMessage.isVisible();
    expect(user3Url).toBe(expectedUser3Url);
    expect(doesInvalidAccessMessageExist).toBe(true);
    await renameFolder(user2Page, user1.data.folder.id, "user2 re-renamed");

    // re-add user3
    await user3Page.goto(workspaceInvitationUrl);
    await acceptWorkspaceInvitation({
      page: user3Page,
      workspaceInvitationUrl,
      sharedWorkspaceId: user1.data.workspace.id,
      password: user3.password,
    });
    await delayForSeconds(2);
    await renameFolder(user3Page, user1.data.folder.id, "user3 re-added");
  });
});
