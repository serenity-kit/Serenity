import { test } from "@playwright/test";
import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { acceptWorkspaceInvitation } from "../../helpers/e2e/acceptWorkspaceInvitation";
import { changeMemberRoleToAdmin } from "../../helpers/e2e/changeMemberRoleToAdmin";
import { changeMemberRoleToEditor } from "../../helpers/e2e/changeMemberRoleToEditor";
import { createWorkspaceInvitation } from "../../helpers/e2e/createWorkspaceInvitation";
import { e2eLoginUser } from "../../helpers/e2e/e2eLoginUser";
import { reloadPage } from "../../helpers/e2e/reloadPage";

type UserData = {
  username: string;
  password: string;
  data: any;
};
let user1: UserData;
let user2: UserData;

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
  user1.data = await createUserWithWorkspace({ ...user1 });
  user2.data = await createUserWithWorkspace({ ...user2 });
  await delayForSeconds(2);
};

test.beforeAll(async () => {
  await sodium.ready;
  await setup();
});

test.describe("Workspace Sharing", () => {
  let workspaceInvitationUrl = "";

  test("Change member role", async ({ browser, page }) => {
    await page.goto("http://localhost:19006/login");
    await e2eLoginUser({
      page,
      username: user1.username,
      password: user1.password,
    });
    await delayForSeconds(2);

    const workspaceInvitationResult = await createWorkspaceInvitation({ page });
    const workspaceInvitationUrl = workspaceInvitationResult.url;
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
    await reloadPage({ page });

    // make user2 an admin
    await changeMemberRoleToAdmin({
      page,
      userId: user2.data.user.id,
      workspaceId: user1.data.workspace.id,
    });
    // make user2 a non-admin
    await changeMemberRoleToEditor({
      page,
      userId: user2.data.user.id,
      workspaceId: user1.data.workspace.id,
    });
  });
});
