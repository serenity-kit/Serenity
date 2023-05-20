import { expect, test } from "@playwright/test";
import { generateId } from "@serenity-tools/common";
import { Role } from "../../../prisma/generated/output";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { createWorkspaceInvitation } from "../../helpers/e2e/createWorkspaceInvitation";
import { e2eLoginUser } from "../../helpers/e2e/e2eLoginUser";
import { registerOnPage } from "../../helpers/e2e/registerOnPage";
import { verifyPassword } from "../../helpers/e2e/verifyPassword";

test.describe("Workspace Sharing", () => {
  let workspaceInvitationUrl = "";
  let sharedWorkspaceId = "";

  test("admin sharing link", async ({ page }) => {
    const role = Role.ADMIN;
    const userId = generateId();
    const username = `${generateId()}@example.com`;
    const password = "password";
    const { workspace, document } = await createUserWithWorkspace({
      id: userId,
      username,
      password,
    });
    await delayForSeconds(2);
    // const workspaceName = "sharable";
    // await page.goto("http://localhost:19006/register");
    // await registerOnPage({ page, username, password, workspaceName });
    await page.goto("http://localhost:19006/login");
    await e2eLoginUser({ page, username, password });
    await delayForSeconds(2);
    await expect(page).toHaveURL(
      `http://localhost:19006/workspace/${workspace.id}/page/${document.id}`
    );
    const { url } = await createWorkspaceInvitation({ page, role });
    expect(url).toContain(
      "http://localhost:19006/accept-workspace-invitation/"
    );
  });

  test("editor sharing link", async ({ page }) => {
    const role = Role.EDITOR;
    const userId = generateId();
    const username = `${generateId()}@example.com`;
    const password = "password";
    const { workspace, document } = await createUserWithWorkspace({
      id: userId,
      username,
      password,
    });
    await delayForSeconds(2);
    // const workspaceName = "sharable";
    // await page.goto("http://localhost:19006/register");
    // await registerOnPage({ page, username, password, workspaceName });
    await page.goto("http://localhost:19006/login");
    await e2eLoginUser({ page, username, password });
    await delayForSeconds(2);
    await expect(page).toHaveURL(
      `http://localhost:19006/workspace/${workspace.id}/page/${document.id}`
    );
    const { url } = await createWorkspaceInvitation({ page, role });
    expect(url).toContain(
      "http://localhost:19006/accept-workspace-invitation/"
    );
  });

  test("commenter sharing link", async ({ page }) => {
    const role = Role.COMMENTER;
    const userId = generateId();
    const username = `${generateId()}@example.com`;
    const password = "password";
    const { workspace, document } = await createUserWithWorkspace({
      id: userId,
      username,
      password,
    });
    await delayForSeconds(2);
    // const workspaceName = "sharable";
    // await page.goto("http://localhost:19006/register");
    // await registerOnPage({ page, username, password, workspaceName });
    await page.goto("http://localhost:19006/login");
    await e2eLoginUser({ page, username, password });
    await delayForSeconds(2);
    await expect(page).toHaveURL(
      `http://localhost:19006/workspace/${workspace.id}/page/${document.id}`
    );
    const { url } = await createWorkspaceInvitation({ page, role });
    expect(url).toContain(
      "http://localhost:19006/accept-workspace-invitation/"
    );
  });

  test("viewer sharing link", async ({ page }) => {
    const role = Role.VIEWER;
    const userId = generateId();
    const username = `${generateId()}@example.com`;
    const password = "password";
    const { workspace, document } = await createUserWithWorkspace({
      id: userId,
      username,
      password,
    });
    await delayForSeconds(2);
    // const workspaceName = "sharable";
    // await page.goto("http://localhost:19006/register");
    // await registerOnPage({ page, username, password, workspaceName });
    await page.goto("http://localhost:19006/login");
    await e2eLoginUser({ page, username, password });
    await delayForSeconds(2);
    await expect(page).toHaveURL(
      `http://localhost:19006/workspace/${workspace.id}/page/${document.id}`
    );
    const { url } = await createWorkspaceInvitation({ page, role });
    expect(url).toContain(
      "http://localhost:19006/accept-workspace-invitation/"
    );
  });

  test("User 1 can create a sharing link", async ({ page }) => {
    const userId = generateId();
    const username = `${generateId()}@example.com`;
    const password = "password";
    const { workspace, document } = await createUserWithWorkspace({
      id: userId,
      username,
      password,
    });
    sharedWorkspaceId = workspace.id;
    await delayForSeconds(2);
    // const workspaceName = "sharable";
    // await page.goto("http://localhost:19006/register");
    // await registerOnPage({ page, username, password, workspaceName });
    await page.goto("http://localhost:19006/login");
    await e2eLoginUser({ page, username, password });
    await delayForSeconds(2);
    await expect(page).toHaveURL(
      `http://localhost:19006/workspace/${workspace.id}/page/${document.id}`
    );
    const { url } = await createWorkspaceInvitation({ page });
    workspaceInvitationUrl = url;
  });

  test("Existing other user can accept workspace", async ({ page }) => {
    const userId = generateId();
    const username = `${generateId()}@example.com`;
    const password = "password";
    const { workspace, document } = await createUserWithWorkspace({
      id: userId,
      username,
      password,
    });
    await delayForSeconds(2);
    await page.goto("http://localhost:19006/login");
    await e2eLoginUser({ page, username, password });
    await delayForSeconds(2);
    await expect(page).toHaveURL(
      `http://localhost:19006/workspace/${workspace.id}/page/${document.id}`
    );
    await page.goto(workspaceInvitationUrl);
    await delayForSeconds(2);

    // click "accept"
    await page.locator('div[role="button"]:has-text("Accept")').click();
    await verifyPassword({
      page,
      password,
      throwIfNotOpen: true,
    });
    await delayForSeconds(2);
    // expect the new url to include the new workspace ID
    const pageUrl = page.url();
    expect(pageUrl).toBe(
      `http://localhost:19006/workspace/${sharedWorkspaceId}/lobby`
    );
  });

  test("Unauthenticated other user can accept workspace", async ({ page }) => {
    const userId = generateId();
    const username = `${generateId()}@example.com`;
    const password = "password";
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
      `http://localhost:19006/workspace/${sharedWorkspaceId}/lobby`
    );
  });

  test("Unregistered other user can accept workspace", async ({ page }) => {
    const username = `${generateId()}@example.com`;
    const password = "password";
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
      `http://localhost:19006/workspace/${sharedWorkspaceId}/lobby`
    );
  });
});
