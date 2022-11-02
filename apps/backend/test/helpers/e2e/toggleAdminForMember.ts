import { expect, Page } from "@playwright/test";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  userId: string;
  workspaceId: string;
  page: Page;
};
export const toggleAdminForMember = async ({
  page,
  userId,
  workspaceId,
}: Props) => {
  const userWorkspaceBefore = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId },
    select: { role: true },
  });
  if (!userWorkspaceBefore) {
    throw new Error("Invalid userId or workspaceId");
  }
  const roleBefore = userWorkspaceBefore.role;
  await page
    .locator(`data-testid=workspace-member-row__${userId}--isAdmin`)
    .click();
  await delayForSeconds(2);
  const userWorkspaceAfter = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId },
    select: { role: true },
  });
  const roleAfter = userWorkspaceAfter?.role;
  expect(roleAfter).not.toBe(roleBefore);
  if (roleBefore !== Role.ADMIN) {
    expect(roleAfter).toBe(Role.ADMIN);
  }
  await delayForSeconds(1);
};
