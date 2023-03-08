import { expect, Page } from "@playwright/test";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../../../src/database/prisma";
import { getRoleAsString } from "../../../src/utils/getRoleAsString";
import { delayForSeconds } from "../delayForSeconds";
import { selectValueFromOptions } from "./utils/selectValueFromOptions";

export type Props = {
  page: Page;
  role?: Role | undefined;
};
export const createWorkspaceInvitation = async ({ page, role }: Props) => {
  await page.locator("text=Settings").click();
  delayForSeconds(1);
  await page.locator("text=Members").click();
  // click "create invitation"
  delayForSeconds(2);
  if (role) {
    const roleAsString = getRoleAsString(role);
    if (!roleAsString) {
      throw new Error("Invalid role");
    }
    await selectValueFromOptions({
      page,
      testID: "invite-members__select-role",
      value: roleAsString,
    });
  }
  await page
    .locator("data-testid=invite-members__create-invitation-button")
    .click();
  await delayForSeconds(2);
  // get invitation text
  const linkInfoDiv = page
    .locator("//div[@data-testid='workspaceInvitationInstructionsText']")
    .first();
  const linkInfoText = await linkInfoDiv.textContent();
  // parse url and store into variable
  const linkInfoWords = linkInfoText?.replace(/\n/g, " ").split(" ") || "";
  const workspaceInvitationUrl = linkInfoWords[linkInfoWords.length - 1];
  expect(workspaceInvitationUrl).toContain(
    "http://localhost:19006/accept-workspace-invitation/"
  );
  // the workspace invitation id is the last part of the url minus the #key
  const workspaceInvitationId = workspaceInvitationUrl
    .split("/")
    .pop()
    ?.split("#")[0];
  const key = workspaceInvitationUrl.split("=").pop();
  const workspaceInvitation = await prisma.workspaceInvitations.findFirst({
    where: { id: workspaceInvitationId },
  });
  expect(workspaceInvitation).not.toBe(null);
  if (role) {
    expect(workspaceInvitation?.role).toBe(role);
  }
  return {
    url: workspaceInvitationUrl,
    workspaceInvitationId,
    key,
    workspaceInvitation,
  };
};
