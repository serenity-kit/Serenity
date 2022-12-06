import { expect, Page, test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { User, Workspace } from "../../../prisma/generated/output";
import { Document } from "../../../src/types/document";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { login } from "../../helpers/e2e/login";
import { logout } from "../../helpers/e2e/logout";
import { register } from "../../helpers/e2e/register";

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
    `http://localhost:19006/workspace/${workspace.id}/page/${document.id}`
  );
};

test("Register and remember login", async ({ page }) => {
  const username = `${uuidv4()}@example.com`;
  const password = "password";
  const workspaceName = "my workspace";
  const stayLoggedIn = true;
  const registrationResult = await register({
    page,
    username,
    password,
    workspaceName,
  });
  expect(registrationResult).not.toBeUndefined();
  expect(registrationResult.user).not.toBe(null);
  expect(registrationResult.workspace).not.toBe(null);
  expect(registrationResult.workspace).not.toBe(null);
  await login({ page, username, password, stayLoggedIn });
  await expectResults({
    page,
    user: registrationResult.user!,
    workspace: registrationResult.workspace!,
    document: registrationResult.document!,
  });
});

test("Register and don't remember login", async ({ page }) => {
  const username = `${uuidv4()}@example.com`;
  const password = "password";
  const workspaceName = "my workspace";
  const stayLoggedIn = false;
  const registrationResult = await register({
    page,
    username,
    password,
    workspaceName,
  });
  expect(registrationResult).not.toBeUndefined();
  expect(registrationResult.user).not.toBe(null);
  expect(registrationResult.workspace).not.toBe(null);
  expect(registrationResult.workspace).not.toBe(null);
  await login({ page, username, password, stayLoggedIn });
  await expectResults({
    page,
    user: registrationResult.user!,
    workspace: registrationResult.workspace!,
    document: registrationResult.document!,
  });
});

test("Register, logout, remember login", async ({ page }) => {
  const username = `${uuidv4()}@example.com`;
  const password = "password";
  const workspaceName = "my workspace";
  const stayLoggedIn = false;
  const registrationResult = await register({
    page,
    username,
    password,
    workspaceName,
  });
  expect(registrationResult).not.toBeUndefined();
  expect(registrationResult.user).not.toBe(null);
  expect(registrationResult.workspace).not.toBe(null);
  expect(registrationResult.workspace).not.toBe(null);
  await logout({ page });
  await delayForSeconds(2);
  await login({ page, username, password, stayLoggedIn });
  await delayForSeconds(2);
  await expectResults({
    page,
    user: registrationResult.user!,
    workspace: registrationResult.workspace!,
    document: registrationResult.document!,
  });
});

test("Register, logout, don't remember login", async ({ page }) => {
  const username = `${uuidv4()}@example.com`;
  const password = "password";
  const workspaceName = "my workspace";
  const stayLoggedIn = false;
  const registrationResult = await register({
    page,
    username,
    password,
    workspaceName,
  });
  expect(registrationResult).not.toBeUndefined();
  expect(registrationResult.user).not.toBe(null);
  expect(registrationResult.workspace).not.toBe(null);
  expect(registrationResult.workspace).not.toBe(null);
  await logout({ page });
  await delayForSeconds(2);
  await login({ page, username, password, stayLoggedIn });
  await delayForSeconds(2);
  await expectResults({
    page,
    user: registrationResult.user!,
    workspace: registrationResult.workspace!,
    document: registrationResult.document!,
  });
});
