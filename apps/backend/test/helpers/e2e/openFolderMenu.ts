import { Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";
import { expandFolderTree } from "./expandFolderTree";
import { hoverOnElement } from "./hoverOnElement";

export const openFolderMenu = async (page: Page, folderId: string) => {
  // 1. locate folder item in sidebar
  const folderItem = page.locator(`data-testid=sidebar-folder--${folderId}`);
  const isVisible = await folderItem.isVisible();
  // 2. if this folder item is not visible, let's expand the tree to expose it
  if (!isVisible) {
    await expandFolderTree(page, folderId);
  }
  // 3. Hover over the folder item to display the "..." menu
  await hoverOnElement(page, folderItem, true);
  await delayForSeconds(1);
  // 4. Find the "..." menu and click it
  const menuButton = page.locator(
    `data-testid=sidebar-folder-menu--${folderId}__open`
  );
  const isSubmenuVisible = await menuButton.isVisible();
  if (!isSubmenuVisible) {
    await openFolderMenu(page, folderId);
  }
  await hoverOnElement(page, menuButton, false);
  await delayForSeconds(2);
  await menuButton.click();
  // 5. Wait a second for the UI to update
  await delayForSeconds(2);
};
