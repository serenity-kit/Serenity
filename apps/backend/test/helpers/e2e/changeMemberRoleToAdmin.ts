import { expect, Page } from "@playwright/test";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../delayForSeconds";
import { openMemberSettingsMemberRoleMenu } from "./openMemberSettingsMemberRoleMenu";
import { reloadPage } from "./reloadPage";
import { verifyPassword } from "./verifyPassword";

export type Props = {
  userId: string;
  workspaceId: string;
  password: string;
  page: Page;
};
export const changeMemberRoleToAdmin = async ({
  page,
  userId,
  password,
  workspaceId,
}: Props) => {
  await openMemberSettingsMemberRoleMenu({ page, userId });
  await page
    .locator(`//div[@data-testid="member-menu--${userId}__make-admin"]`)
    .click();
  await verifyPassword({
    page,
    password,
    throwIfNotOpen: false,
  });
  await delayForSeconds(1);
  await reloadPage({ page });
  const userWorkspaceAfter = await prisma.usersToWorkspaces.findFirst({
    where: { userId, workspaceId },
    select: { role: true },
  });

  const roleAfter = userWorkspaceAfter?.role;
  expect(roleAfter).toBe(Role.ADMIN);
};
