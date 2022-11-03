import { Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  userId: string;
  page: Page;
};
export const openMemberSettingsMemberRoleMenu = async ({
  page,
  userId,
}: Props) => {
  await page.$eval(`data-testid=member-settings--scroll-view`, (element) => {
    element.scrollTop = element.scrollHeight;
  });
  await page.locator(`data-testid=member-menu--${userId}__open`).click();
  await delayForSeconds(2);
};
