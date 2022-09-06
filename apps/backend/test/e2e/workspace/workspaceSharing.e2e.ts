import { expect, Page, test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../../src/database/prisma";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";

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
  await page
    .locator('[aria-label="This is the terms and condition checkbox"] >> nth=1')
    .click();

  // Click "register button"
  await page.locator('div[role="button"]:has-text("Register")').click();

  await delayForSeconds(1);
  // unverified user should have been created
  const unverifiedUser = await prisma.unverifiedUser.findFirst({
    where: { username },
  });
  expect(unverifiedUser).not.toBe(null);
  const confirmationCode = unverifiedUser?.confirmationCode || "";
  const confirmRegistrationUrl = `http://localhost:3000/registration-verification?username=${encodeURIComponent(
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
      'text=Verify your emailPlease enter the verification code sent to you via email.Verifi >> div[role="button"]'
    )
    .click();
};

type CreateFirstWorkspaceProps = {
  page: Page;
  workspaceName: string;
};
const createFirstWorkspace = async ({
  page,
  workspaceName,
}: CreateFirstWorkspaceProps) => {
  await expect(page).toHaveURL("http://localhost:3000/onboarding");
  // Fill in the new workspace name
  await page
    .locator(
      'text=Workspace nameThis is the name of your organization, team or private notes. You  >> input[type="text"]'
    )
    .fill(workspaceName);

  // Click the "create" button
  await page.locator('div[role="button"]:has-text("Create")').click();
};

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
    await loginOnPage({ page, username, password });
    await delayForSeconds(2);
    await expect(page).toHaveURL(
      `http://localhost:3000/workspace/${workspace.id}/page/${document.id}`
    );

    // click on workspace settings
    await page.locator("text=Settings").click();
    delayForSeconds(2);
    await expect(page).toHaveURL(
      `http://localhost:3000/workspace/${workspace.id}/settings/general`
    );
    await page.locator("text=Members").click();

    // click "create invitation"
    await page
      .locator('div[role="button"]:has-text("Create Invitation")')
      .click();
    await delayForSeconds(2);

    // get invitation text
    const linkInfoDiv = page
      .locator("//input[@id='workspaceInvitationInstructionsInput']")
      .first();
    const linkInfoText = await linkInfoDiv.inputValue();
    // parse url and store into variable
    const linkInfoWords = linkInfoText.split(" ");
    workspaceInvitationUrl = linkInfoWords[linkInfoWords.length - 1];
    // expect there to be one invitation in the list
    const numInvitations = await page
      .locator("//div[@id='workspaceInviteeList']/div/div")
      .count();
    expect(numInvitations).toBe(1);
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
    await loginOnPage({ page, username, password });
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
    const lastIndexOfSlash = pageUrl.lastIndexOf("/");
    const pageUrlStart = pageUrl.substring(0, lastIndexOfSlash + 1);
    expect(pageUrlStart).toBe(
      `http://localhost:3000/workspace/${sharedWorkspaceId}/page/`
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
    await loginOnPage({ page, username, password });
    await delayForSeconds(2);
    // expect the new url to include the new workspace ID
    const pageUrl = page.url();
    const lastIndexOfSlash = pageUrl.lastIndexOf("/");
    const pageUrlStart = pageUrl.substring(0, lastIndexOfSlash + 1);
    expect(pageUrlStart).toBe(
      `http://localhost:3000/workspace/${sharedWorkspaceId}/page/`
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
    const pageUrlStart = pageUrl.substring(0, lastIndexOfSlash + 1);
    expect(pageUrlStart).toBe(
      `http://localhost:3000/workspace/${sharedWorkspaceId}/page/`
    );
  });
});
