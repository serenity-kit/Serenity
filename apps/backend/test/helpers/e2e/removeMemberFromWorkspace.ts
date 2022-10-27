import { Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";
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
  await page
    .locator(`data-testid=workspace-member-row__${userId}--remove`)
    .click();
  await verifyPassword({ page, password, throwIfNotOpen: false });
  await delayForSeconds(1);
};
