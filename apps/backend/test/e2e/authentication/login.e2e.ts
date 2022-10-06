import { expect, test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { e2eLoginUser } from "../../helpers/e2e/e2eLoginUser";
import { e2eRegisterUser } from "../../helpers/e2e/e2eRegisterUser";

test("Login without remembering web keys", async ({ page }) => {
  const username = `${uuidv4()}@example.com`;
  const password = "pass";
  const { workspace, document } = await createUserWithWorkspace({
    id: uuidv4(),
    username,
    password,
  });

  await page.goto("http://localhost:3000/login");
  await e2eLoginUser({ page, username, password, stayLoggedIn: false });
  delayForSeconds(3);
  await expect(page).toHaveURL(
    `http://localhost:3000/workspace/${workspace.id}/page/${document.id}`
  );
});

test("Login and remember web keys", async ({ page }) => {
  const username = `${uuidv4()}@example.com`;
  const password = "pass";
  const { workspace, document } = await createUserWithWorkspace({
    id: uuidv4(),
    username,
    password,
  });

  await page.goto("http://localhost:3000/login");
  await e2eLoginUser({ page, username, password, stayLoggedIn: true });
  delayForSeconds(3);
  await expect(page).toHaveURL(
    `http://localhost:3000/workspace/${workspace.id}/page/${document.id}`
  );
});

test("Register then Login", async ({ page }) => {
  const username = `${uuidv4()}@example.com`;
  const password = "pass";
  await page.goto("http://localhost:3000/register");
  const { workspace, document } = await e2eRegisterUser({
    page,
    username,
    password,
    workspaceName: uuidv4(),
  });
  await page.goto("http://localhost:3000/login");
  delayForSeconds(3);
  await e2eLoginUser({ page, username, password, stayLoggedIn: true });
  delayForSeconds(3);
  await expect(page).toHaveURL(
    `http://localhost:3000/workspace/${workspace?.id}/page/${document?.id}`
  );
});
