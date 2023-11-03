import { expect, test } from "@playwright/test";
import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { e2eRegisterUser } from "../../helpers/e2e/e2eRegisterUser";

test.beforeAll(async () => {
  await sodium.ready;
});

test("Register", async ({ page }) => {
  const username = `${generateId()}@example.com`;
  const password = "password22room5K42";
  const workspaceName = "my workspace";

  // Go to registration url
  await page.goto("http://localhost:19006/register");
  await delayForSeconds(2);

  const registrationResult = await e2eRegisterUser({
    page,
    username,
    password,
    workspaceName,
  });
  expect(registrationResult).not.toBeUndefined();

  await delayForSeconds(3);
  const user = await prisma.user.findFirst({ where: { username } });
  expect(user).not.toBe(null);
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: { userId: user?.id },
  });
  expect(userToWorkspace).not.toBe(null);
  const workspaceId = userToWorkspace?.workspaceId;
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId },
  });
  expect(workspace).not.toBe(null);
  // a page will have been created
  const document = await prisma.document.findFirst({ where: { workspaceId } });
  expect(document).not.toBe(null);
  const documentId = document?.id;
  // TODO: get the workspace id and expect URL to match
  await expect(page).toHaveURL(
    `http://localhost:19006/workspace/${workspaceId}/page/${documentId}`
  );
});
