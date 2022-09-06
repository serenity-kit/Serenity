import { Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../delayForSeconds";
import { hoverOnElement } from "./hoverOnElement";

export const expandFolderTree = async (page: Page, folderId: string) => {
  // 1. locate folder item in sidebar
  const isVisible = await page
    .locator(`data-testid=sidebar-folder--${folderId}`)
    .isVisible();
  // 2. if this folder item is not visible, recursively expand the folder tree to expose it
  if (!isVisible) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId },
    });
    if (folder?.parentFolderId) {
      await expandFolderTree(page, folder.parentFolderId);
    }
    const folderItem = page.locator(`data-testid=sidebar-folder--${folderId}`);
    await hoverOnElement(page, folderItem, true);
    await folderItem.click();
    await delayForSeconds(1);
  }
};
