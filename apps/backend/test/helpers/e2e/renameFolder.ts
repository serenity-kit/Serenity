import { expect, Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";
import { expandFolderTree } from "./expandFolderTree";
import { openFolderMenu } from "./openFolderMenu";
import { reloadPage } from "./reloadPage";
import { waitForElementTextChange } from "./utils/waitForElementTextChange";

export const renameFolder = async (
  page: Page,
  folderId: string,
  newName: string
) => {
  await openFolderMenu(page, folderId);
  await page
    .locator(`data-testid=sidebar-folder-menu--${folderId}__rename`)
    .click();
  await delayForSeconds(1);
  await page
    .locator(`data-testid=sidebar-folder--${folderId}__edit-name`)
    .fill(newName);
  await page
    .locator(`data-testid=sidebar-folder--${folderId}__edit-name`)
    .press("Enter");
  await delayForSeconds(3);
  const renamedFolderMenu = page.locator(
    `data-testid=sidebar-folder--${folderId}`
  );
  const renamedFolderMenuText = await renamedFolderMenu.textContent();
  expect(renamedFolderMenuText).toBe(newName);
  await reloadPage({ page });
  await expandFolderTree(page, folderId);
  const renamedFolderMenu1 = page.locator(
    `data-testid=sidebar-folder--${folderId}`
  );
  const renamedFolderMenuText1 = await waitForElementTextChange({
    element: renamedFolderMenu1,
    initialText: "loading…",
  });
  expect(renamedFolderMenuText1).toBe(newName);
};
