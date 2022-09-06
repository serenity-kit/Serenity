import { expect, test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";

test("Login without remembering web keys", async ({ page }) => {
  const username = `${uuidv4()}@example.com`;
  const password = "pass";
  const { workspace, document } = await createUserWithWorkspace({
    id: uuidv4(),
    username,
    password,
  });

  await page.goto("http://localhost:3000/login");

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
  delayForSeconds(3);
  await expect(page).toHaveURL(
    `http://localhost:3000/workspace/${workspace.id}/page/${document.id}`
  );
});
