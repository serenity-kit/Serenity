import { test } from "@playwright/test";
import * as sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { acceptWorkspaceInvitation } from "../../helpers/e2e/acceptWorkspaceInvitation";
import { createWorkspaceInvitation } from "../../helpers/e2e/createWorkspaceInvitation";
import { e2eLoginUser } from "../../helpers/e2e/e2eLoginUser";
import { reloadPage } from "../../helpers/e2e/reloadPage";
import { toggleAdminForMember } from "../../helpers/e2e/toggleAdminForMember";

type UserData = {
  id: string;
  username: string;
  password: string;
  data: any;
};
const user1: UserData = {
  id: uuidv4(),
  username: `${uuidv4()}@example.com`,
  password: "pass",
  data: undefined,
};
const user2: UserData = {
  id: uuidv4(),
  username: `${uuidv4()}@example.com`,
  password: "pass",
  data: undefined,
};

const setup = async () => {
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
    await page.goto("http://localhost:3000/login");
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
    await reloadPage({ page });

    // make user2 an admin
    await toggleAdminForMember({
      page,
      userId: user2.data.user.id,
      workspaceId: user1.data.workspace.id,
    });
    // make user2 a non-admin
    await toggleAdminForMember({
      page,
      userId: user2.data.user.id,
      workspaceId: user1.data.workspace.id,
    });
  });
});
