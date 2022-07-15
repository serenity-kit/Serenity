import { test, expect, Page } from "@playwright/test";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import deleteAllRecords from "../../helpers/deleteAllRecords";
import { v4 as uuidv4 } from "uuid";
import { userIdFromUsername } from "../../../src/graphql/queries/userIdFromUsername";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { registerUnverifiedUser } from "../../helpers/authentication/registerUnverifiedUser";
import { prisma } from "../../../src/database/prisma";

test.beforeAll(async () => {
  await deleteAllRecords();
});

type LoginOnPageProps = { page: Page; username: string; password: string };
const loginOnPage = async ({ page, username, password }: LoginOnPageProps) => {
  // Fill username input
  await page
    .locator(
      'text=EmailPasswordStay logged in for 30 daysLog in >> [placeholder="Enter your email …"]'
    )
    .fill(username);

  // Fill password input
  await page
    .locator(
      'text=EmailPasswordStay logged in for 30 daysLog in >> [placeholder="Enter your password …"]'
    )
    .fill(password);

  // Click "Log in" button
  await page.locator('div[role="button"]:has-text("Log in")').click();
};

type RegisterOnPageProps = {
  page: Page;
  username: string;
  password: string;
  workspaceName: string;
};
const registerOnPage = async ({
  page,
  username,
  password,
  workspaceName,
}: RegisterOnPageProps) => {
  // Fill username
  await page.locator('[placeholder="Enter your email …"]').fill(username);

  // Fill password
  await page.locator('[placeholder="Enter your password …"]').fill(password);

  // Click "i agree" checkbox
  await page.locator("div > div:nth-child(2) > .css-view-1dbjc4n").click();

  // Click "register button"
  await page.locator('div[role="button"]:has-text("Register")').click();

  await delayForSeconds(1);
  // unverified user should have been created
  const unverifiedUser = await prisma.unverifiedUser.findFirst({
    where: { username },
  });
  expect(unverifiedUser).not.toBe(null);
  const confirmationCode = unverifiedUser?.confirmationCode || "";
  const confirmRegistrationUrl = `http://localhost:19006/registration-verification?username=${encodeURIComponent(
    username
  )}&verification=${encodeURIComponent(confirmationCode)}`;

  await expect(page).toHaveURL(confirmRegistrationUrl);

  // TODO: fill in the verification code from data retrieved from user table
  await page
    .locator('[placeholder="Enter the verification code …"]')
    .fill(confirmationCode);

  // Click the "Verify registration" button
  await page
    .locator(
      'text=Verify your EmailPlease enter the verification code sent to you via Email.Verifi >> div[role="button"]'
    )
    .click();
  await expect(page).toHaveURL("http://localhost:19006/onboarding");

  // Fill in the new workspace name
  await page
    .locator(
      'text=Workspace NameThis is the name of your organization, team or private notes. You  >> input[type="text"]'
    )
    .fill(workspaceName);

  // Click the "create" button
  await page.locator('div[role="button"]:has-text("Create")').click();
};

test.describe("Workspace Sharing", () => {
  let workspaceInvitationUrl = "";
  let sharedWorkspaceId = "";

  test.beforeEach(async ({ browser }) => {
    // create new browser contexts for each potential user
    const context = await browser.newContext();
    await context.newPage();
  });

  test("User 1 can create a sharing link", async ({ page }) => {
    const userId = uuidv4();
    const username = "user1@example.com";
    const password = "password";
    const { workspace } = await createUserWithWorkspace({
      id: userId,
      username,
    });
    sharedWorkspaceId = workspace.id;
    await loginOnPage({ page, username, password });
    // click on workspace settings
    // click "create invitation"
    // get invitation text
    // parse url and store into variable
    // expect there to be one invitation in the list
  });

  test("Existing other user can accept workspace", async ({ page }) => {
    const userId = uuidv4();
    const username = "user2@example.com";
    const password = "password";
    await createUserWithWorkspace({
      id: userId,
      username,
    });
    await page.goto("http://localhost:19006/login");
    await loginOnPage({ page, username, password });
    await page.goto(workspaceInvitationUrl);
    // click "accept"
    await page.locator('div[role="button"]:has-text("Accept")').click();
    // expect the new url to include the new workspace ID
    expect(page.url).toContain(
      `http://localhost:19006/workspace/${sharedWorkspaceId}/page/`
    );
  });

  test("Unauthenticated other user can accept workspace", async ({ page }) => {
    const userId = uuidv4();
    const username = "user3@example.com";
    const password = "password";
    await createUserWithWorkspace({
      id: userId,
      username,
    });
    await page.goto(workspaceInvitationUrl);
    await loginOnPage({ page, username, password });
    // expect the new url to include the new workspace ID
    expect(page.url).toContain(
      `http://localhost:19006/workspace/${sharedWorkspaceId}/page/`
    );
  });

  test("Unregistered other user can accept workspace", async ({ page }) => {
    const username = "user4@example.com";
    const password = "password";
    const workspaceName = "my workspace";
    await page.goto(workspaceInvitationUrl);
    // click "register" button
    await page.locator('a[role="link"]:has-text("Register here")').click();
    await registerOnPage({ page, username, password, workspaceName });
    // expect new URL to include the shared workspace ID
    expect(page.url).toContain(
      `http://localhost:19006/workspace/${sharedWorkspaceId}/page/`
    );
  });
});
