import { Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";
import { openMemberSettingsMemberRoleMenu } from "./openMemberSettingsMemberRoleMenu";
import { verifyPassword } from "./verifyPassword";

export type Props = {
  userId: string;
  page: Page;
  password: string;
};
export const removeMemberFromWorkspace = async ({
  page,
  userId,
  password,
}: Props) => {
  await openMemberSettingsMemberRoleMenu({ page, userId });
  await page.locator(`data-testid=member-menu--${userId}__delete`).click();
  await verifyPassword({ page, password, throwIfNotOpen: false });
  await delayForSeconds(1);
};
