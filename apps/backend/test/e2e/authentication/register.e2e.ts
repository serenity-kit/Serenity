import { expect, test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../../src/database/prisma";
import { e2eRegisterUser } from "../../helpers/authentication/e2eRegisterUser";
import { delayForSeconds } from "../../helpers/delayForSeconds";

test("Register", async ({ page }) => {
  const username = `${uuidv4()}@example.com`;
  const password = "password";
  const workspaceName = "my workspace";

  // Go to registration url
  await page.goto("http://localhost:3000/register");
  await delayForSeconds(2);

  const registrationResult = await e2eRegisterUser({
    page,
    username,
    password,
    workspaceName,
  });
  expect(registrationResult).not.toBeUndefined();

  await delayForSeconds(3);
  const user = await prisma.user.findFirst({
    where: { username },
  });
  expect(user).not.toBe(null);
  const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
    where: {
      userId: user?.id,
    },
  });
  expect(userToWorkspace).not.toBe(null);
  const workspaceId = userToWorkspace?.workspaceId;
  const workspace = await prisma.workspace.findFirst({
    where: {
      name: workspaceName,
      id: workspaceId,
    },
  });
  expect(workspace).not.toBe(null);
  // a page will have been created
  const document = await prisma.document.findFirst({
    where: {
      workspaceId,
    },
  });
  expect(document).not.toBe(null);
  const documentId = document?.id;
  // TODO: get the workspace id and expect URL to match
  await expect(page).toHaveURL(
    `http://localhost:3000/workspace/${workspaceId}/page/${documentId}`
  );
});
