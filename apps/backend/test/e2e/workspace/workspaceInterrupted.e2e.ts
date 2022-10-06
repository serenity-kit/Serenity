import test, { expect, Page } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { User, Workspace } from "../../../prisma/generated/output";
import { Document } from "../../../src/types/document";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { createWorkspaceOnOnboarding } from "../../helpers/e2e/createWorkspaceOnboarding";
import { login } from "../../helpers/e2e/login";
import { registerWithoutOnboarding } from "../../helpers/e2e/registerWithoutOnboarding";
import { reloadPage } from "../../helpers/e2e/reloadPage";

// NOTE: these tests don't work until we can
// ask user to verify password and retrieve mainDevice

type ExpectResultsProps = {
  page: Page;
  user: User;
  workspace: Workspace;
  document: Document;
};
const expectResults = async ({
  page,
  user,
  workspace,
  document,
}: ExpectResultsProps) => {
  expect(user).not.toBeUndefined();
  expect(workspace).not.toBeUndefined();
  expect(workspace).not.toBeUndefined();
  await delayForSeconds(3);
  // TODO: get the workspace id and expect URL to match
  await expect(page).toHaveURL(
    `http://localhost:3000/workspace/${workspace.id}/page/${document.id}`
  );
};

test.skip("Register and reload before onboarding", async ({ page }) => {
  const username = `${uuidv4()}@example.com`;
  const password = "password";
  const workspaceName = "my workspace";
  await page.goto("http://localhost:3000/register");
  await delayForSeconds(2);
  const registrationResult = await registerWithoutOnboarding({
    page,
    username,
    password,
  });
  expect(registrationResult).not.toBeUndefined();
  expect(registrationResult.user).not.toBe(null);
  expect(registrationResult.mainDevice).not.toBe(null);
  await expect(page).toHaveURL("http://localhost:3000/onboarding");
  await reloadPage({ page });
  await expect(page).toHaveURL("http://localhost:3000/onboarding");
  const createWorkspaceResult = await createWorkspaceOnOnboarding({
    page,
    username,
    workspaceName,
  });
  // TODO: expect a verify password modal
  expect(registrationResult).not.toBeUndefined();
  await expectResults({
    page,
    user: createWorkspaceResult.user!,
    workspace: createWorkspaceResult.workspace!,
    document: createWorkspaceResult.document!,
  });
});

test.skip("Register and re-login before onboarding", async ({ page }) => {
  const username = `${uuidv4()}@example.com`;
  const password = "password";
  const workspaceName = "my workspace";
  await page.goto("http://localhost:3000/register");
  await delayForSeconds(2);
  const registrationResult = await registerWithoutOnboarding({
    page,
    username,
    password,
  });
  expect(registrationResult).not.toBeUndefined();
  expect(registrationResult.user).not.toBe(null);
  expect(registrationResult.mainDevice).not.toBe(null);
  await expect(page).toHaveURL("http://localhost:3000/onboarding");
  await page.goto("http://localhost:3000/register");
  await login({ page, username, password, stayLoggedIn: true });
  await expect(page).toHaveURL("http://localhost:3000/onboarding");
  const createWorkspaceResult = await createWorkspaceOnOnboarding({
    page,
    username,
    workspaceName,
  });
  expect(registrationResult).not.toBeUndefined();
  await expectResults({
    page,
    user: createWorkspaceResult.user!,
    workspace: createWorkspaceResult.workspace!,
    document: createWorkspaceResult.document!,
  });
});