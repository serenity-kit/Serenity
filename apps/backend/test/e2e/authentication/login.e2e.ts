import { test, expect } from "@playwright/test";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import deleteAllRecords from "../../helpers/deleteAllRecords";
import { v4 as uuidv4 } from "uuid";
import { delayForSeconds } from "../../helpers/delayForSeconds";

test.beforeAll(async () => {
  await deleteAllRecords();
});

test("Login without remembering web keys", async ({ page }) => {
  const userId = uuidv4();
  const username = "a@a.com";
  const password = "pass";
  const { user, workspace, document } = await createUserWithWorkspace({
    id: userId,
    username,
    password,
  });

  await page.goto("http://localhost:19006/login");

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
  delayForSeconds(2);
  await expect(page).toHaveURL(
    `http://localhost:19006/workspace/${workspace.id}/page/${document.id}`
  );
});
