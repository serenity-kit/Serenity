import { generateId } from "@naisho/core";
import { expect, Page, test } from "@playwright/test";
import { User } from "../../../prisma/generated/output";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { Document } from "../../../src/types/document";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { login } from "../../helpers/e2e/login";
import { register } from "../../helpers/e2e/register";

type ExpectResultsProps = {
  page: Page;
  user: User;
  workspace: any; // GraphQL result type - not the prisma type
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
  await delayForSeconds(3);
  // TODO: get the workspace id and expect URL to match
  await expect(page).toHaveURL(
    `http://localhost:19006/workspace/${workspace.id}/page/${document.id}`
  );
};

test("Register multiple users", async ({ page }) => {
  const registrationResult1 = await register({
    page,
    username: `${generateId()}@example.com`,
    password: "password",
    workspaceName: generateId(),
  });
  await expectResults({
    page,
    user: registrationResult1.user!,
    workspace: registrationResult1.workspace!,
    document: registrationResult1.document!,
  });
  const registrationResult2 = await register({
    page,
    username: `${generateId()}@example.com`,
    password: "password",
    workspaceName: generateId(),
  });
  await expectResults({
    page,
    user: registrationResult2.user!,
    workspace: registrationResult2.workspace!,
    document: registrationResult2.document!,
  });
});

test("Multi reg, multi remember login", async ({ page }) => {
  const password = "password";
  const stayLoggedIn = true;
  const registrationResult1 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password,
  });
  const registrationResult2 = await createUserWithWorkspace({
    id: generateId(),
    username: `${generateId()}@example.com`,
    password,
  });
  await login({
    page,
    username: registrationResult1.user!.username,
    password,
    stayLoggedIn,
  });
  await expectResults({
    page,
    user: registrationResult1.user!,
    workspace: registrationResult1.workspace!,
    document: registrationResult1.document!,
  });
  await login({
    page,
    username: registrationResult2.user!.username,
    password,
    stayLoggedIn,
  });
  await expectResults({
    page,
    user: registrationResult2.user!,
    workspace: registrationResult2.workspace!,
    document: registrationResult2.document!,
  });
});

test("Multi reg, multi forget login", async ({ page }) => {
  const password = "password";
  const stayLoggedIn = false;
  const registrationResult1 = await register({
    page,
    username: `${generateId()}@example.com`,
    password,
    workspaceName: generateId(),
  });
  const registrationResult2 = await register({
    page,
    username: `${generateId()}@example.com`,
    password,
    workspaceName: generateId(),
  });
  await login({
    page,
    username: registrationResult1.user!.username,
    password,
    stayLoggedIn,
  });
  await expectResults({
    page,
    user: registrationResult1.user!,
    workspace: registrationResult1.workspace!,
    document: registrationResult1.document!,
  });
  await login({
    page,
    username: registrationResult2.user!.username,
    password,
    stayLoggedIn,
  });
  await expectResults({
    page,
    user: registrationResult2.user!,
    workspace: registrationResult2.workspace!,
    document: registrationResult2.document!,
  });
});

test("Multi reg, multi mixed login", async ({ page }) => {
  const password = "password";
  const registrationResult1 = await register({
    page,
    username: `${generateId()}@example.com`,
    password,
    workspaceName: generateId(),
  });
  const registrationResult2 = await register({
    page,
    username: `${generateId()}@example.com`,
    password,
    workspaceName: generateId(),
  });
  await login({
    page,
    username: registrationResult1.user!.username,
    password,
    stayLoggedIn: true,
  });
  await expectResults({
    page,
    user: registrationResult1.user!,
    workspace: registrationResult1.workspace!,
    document: registrationResult1.document!,
  });
  await login({
    page,
    username: registrationResult2.user!.username,
    password,
    stayLoggedIn: false,
  });
  await expectResults({
    page,
    user: registrationResult2.user!,
    workspace: registrationResult2.workspace!,
    document: registrationResult2.document!,
  });
});
