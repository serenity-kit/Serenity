import { expect, Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
};
export const createWorkspaceInvitation = async ({ page }: Props) => {
  await page.locator("text=Settings").click();
  delayForSeconds(2);
  await page.locator("text=Members").click();
  await page
    .locator('div[role="button"]:has-text("Create Invitation")')
    .click();
  await delayForSeconds(2);
  const expectedNumInvitations = await page
    .locator("//div[@id='workspaceInviteeList']/div/div")
    .count();
  const linkInfoDiv = page
    .locator("//input[@id='workspaceInvitationInstructionsInput']")
    .first();
  const linkInfoText = await linkInfoDiv.inputValue();
  const linkInfoWords = linkInfoText.split(" ");
  const workspaceInvitationUrl = linkInfoWords[linkInfoWords.length - 1];
  const numInvitations = await page
    .locator("//div[@id='workspaceInviteeList']/div/div")
    .count();
  expect(numInvitations).toBe(expectedNumInvitations);
  return { url: workspaceInvitationUrl };
};
