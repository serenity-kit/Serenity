import { expect, test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { createWorkspaceInvitation } from "../../helpers/e2e/createWorkspaceInvitation";
import { e2eLoginUser } from "../../helpers/e2e/e2eLoginUser";
import { registerOnPage } from "../../helpers/e2e/registerOnPage";

test.describe("Workspace Sharing", () => {
  let workspaceInvitationUrl = "";
  let sharedWorkspaceId = "";

  test("User 1 can create a sharing link", async ({ page }) => {
    const userId = uuidv4();
    const username = `${uuidv4()}@example.com`;
    const password = "pass";
    const { workspace, document } = await createUserWithWorkspace({
      id: userId,
      username,
      password,
    });
    sharedWorkspaceId = workspace.id;
    await delayForSeconds(2);
    // const workspaceName = "sharable";
    // await page.goto("http://localhost:3000/register");
    // await registerOnPage({ page, username, password, workspaceName });
    await page.goto("http://localhost:3000/login");
    await e2eLoginUser({ page, username, password });
    await delayForSeconds(2);
    await expect(page).toHaveURL(
      `http://localhost:3000/workspace/${workspace.id}/page/${document.id}`
    );

    const workspaceInvitationResult = await createWorkspaceInvitation({ page });
    workspaceInvitationUrl = workspaceInvitationResult.url;
  });

  test("Existing other user can accept workspace", async ({ page }) => {
    const userId = uuidv4();
    const username = `${uuidv4()}@example.com`;
    const password = "pass";
    const { workspace, document } = await createUserWithWorkspace({
      id: userId,
      username,
      password,
    });
    await delayForSeconds(2);
    await page.goto("http://localhost:3000/login");
    await e2eLoginUser({ page, username, password });
    await delayForSeconds(2);
    await expect(page).toHaveURL(
      `http://localhost:3000/workspace/${workspace.id}/page/${document.id}`
    );
    await page.goto(workspaceInvitationUrl);
    await delayForSeconds(2);
    // click "accept"
    await page.locator('div[role="button"]:has-text("Accept")').click();
    await delayForSeconds(5);
    // expect the new url to include the new workspace ID
    const pageUrl = page.url();
    expect(pageUrl).toBe(
      `http://localhost:3000/workspace/${sharedWorkspaceId}/lobby`
    );
  });

  test("Unauthenticated other user can accept workspace", async ({ page }) => {
    const userId = uuidv4();
    const username = `${uuidv4()}@example.com`;
    const password = "pass";
    await createUserWithWorkspace({
      id: userId,
      username,
      password,
    });
    await delayForSeconds(2);
    await page.goto(workspaceInvitationUrl);
    await delayForSeconds(2);
    await e2eLoginUser({ page, username, password });
    await delayForSeconds(2);
    // expect the new url to include the new workspace ID
    const pageUrl = page.url();
    const lastIndexOfSlash = pageUrl.lastIndexOf("/");
    expect(pageUrl).toBe(
      `http://localhost:3000/workspace/${sharedWorkspaceId}/lobby`
    );
  });

  test("Unregistered other user can accept workspace", async ({ page }) => {
    const username = `${uuidv4()}@example.com`;
    const password = "pass";
    const workspaceName = "my workspace";
    await page.goto(workspaceInvitationUrl);
    await delayForSeconds(2);
    // click "register" button
    await page.locator("text=Register here").click();
    await delayForSeconds(2);
    await registerOnPage({ page, username, password, workspaceName });
    await delayForSeconds(2);
    // expect new URL to include the shared workspace ID
    const pageUrl = page.url();
    const lastIndexOfSlash = pageUrl.lastIndexOf("/");
    expect(pageUrl).toBe(
      `http://localhost:3000/workspace/${sharedWorkspaceId}/lobby`
    );
  });
});
