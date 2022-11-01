import { expect, Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
};
export const createWorkspaceInvitation = async ({ page }: Props) => {
  await page.locator("text=Settings").click();
  delayForSeconds(1);
  await page.locator("text=Members").click();
  delayForSeconds(2);
  await page
    .locator('div[role="button"]:has-text("Create Invitation")')
    .click();
  await delayForSeconds(2);
  const linkInfoDiv = page
    .locator("//div[@data-testid='workspaceInvitationInstructionsText']")
    .first();
  const linkInfoText = await linkInfoDiv.textContent();
  const linkInfoWords = linkInfoText?.replace(/\n/g, " ").split(" ") || "";
  const workspaceInvitationUrl = linkInfoWords[linkInfoWords.length - 1];
  expect(workspaceInvitationUrl).toContain(
    "http://localhost:3000/accept-workspace-invitation/"
  );
  return { url: workspaceInvitationUrl };
};
