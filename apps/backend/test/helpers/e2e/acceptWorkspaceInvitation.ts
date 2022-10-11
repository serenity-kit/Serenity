import { expect, Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
  workspaceInvitationUrl: string;
  sharedWorkspaceId: string;
};
export const acceptWorkspaceInvitation = async ({
  page,
  workspaceInvitationUrl,
  sharedWorkspaceId,
}: Props) => {
  await page.goto(workspaceInvitationUrl);
  await delayForSeconds(2);
  // click "accept"
  await page.locator('div[role="button"]:has-text("Accept")').click();
  await delayForSeconds(2);
  // expect the new url to include the new workspace ID
  let inLobby = true;
  const lobbyUrl = `http://localhost:3000/workspace/${sharedWorkspaceId}/lobby`;
  while (inLobby) {
    const pageUrl = page.url();
    if (pageUrl === lobbyUrl) {
      await delayForSeconds(1);
    } else {
      inLobby = false;
    }
  }
  const pageUrl = page.url();
  const urlAsExpected = pageUrl.startsWith(
    `http://localhost:3000/workspace/${sharedWorkspaceId}/page`
  );
  expect(urlAsExpected).toBe(true);
  // now wait for decryption
  await delayForSeconds(5);
};
