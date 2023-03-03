import { expect, Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
};
export const createWorkspaceInvitation = async ({ page }: Props) => {
  await page.locator("text=Settings").click();
  delayForSeconds(1);
  await page.locator("text=Members").click();
  // click "create invitation"
  delayForSeconds(2);
  await page
    .locator("data-testid=invite-members__create-invitation-button")
    .click();
  await delayForSeconds(200);
  await delayForSeconds(2);
  // get invitation text
  const linkInfoDiv = page
    .locator("//div[@data-testid='workspaceInvitationInstructionsText']")
    .first();
  const linkInfoText = await linkInfoDiv.textContent();
  console.log({ linkInfoText });
  // parse url and store into variable
  const linkInfoWords = linkInfoText?.replace(/\n/g, " ").split(" ") || "";
  const workspaceInvitationUrl = linkInfoWords[linkInfoWords.length - 1];
  console.log({ workspaceInvitationUrl });
  expect(workspaceInvitationUrl).toContain(
    "http://localhost:19006/accept-workspace-invitation/"
  );
  return { url: workspaceInvitationUrl };
};
