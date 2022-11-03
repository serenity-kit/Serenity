import { expect, Page } from "@playwright/test";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../delayForSeconds";
import { openMemberSettingsMemberRoleMenu } from "./openMemberSettingsMemberRoleMenu";

export type Props = {
  userId: string;
  workspaceId: string;
  page: Page;
};
export const changeMemberRoleToEditor = async ({
  page,
  userId,
  workspaceId,
}: Props) => {
  await openMemberSettingsMemberRoleMenu({ page, userId });
  await page.locator(`data-testid=member-menu--${userId}__make-editor`).click();
  await delayForSeconds(2);
  const userWorkspaceAfter = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId },
    select: { role: true },
  });
  const roleAfter = userWorkspaceAfter?.role;
  expect(roleAfter).toBe(Role.EDITOR);
  await delayForSeconds(1);
};
