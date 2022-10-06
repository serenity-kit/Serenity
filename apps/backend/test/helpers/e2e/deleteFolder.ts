import { expect, Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../delayForSeconds";
import { hoverOnElement } from "./hoverOnElement";
import { openFolderMenu } from "./openFolderMenu";
import { reloadPage } from "./reloadPage";

export const deleteFolder = async (
  page: Page,
  folderId: string,
  workspaceId: string
) => {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, workspaceId },
  });
  if (!folder) {
    throw new Error("Folder now found");
  }
  const numFoldersBeforeDelete = await prisma.folder.count({
    where: { workspaceId },
  });
  await openFolderMenu(page, folderId);
  const deleteMenu = page.locator(
    `[data-testid=sidebar-folder-menu--${folderId}__delete]`
  );
  await hoverOnElement(page, deleteMenu, false);
  await deleteMenu.click();
  await delayForSeconds(2);
  const numFoldersAfterDelete = await prisma.folder.count({
    where: { workspaceId },
  });
  expect(numFoldersAfterDelete).toBe(numFoldersBeforeDelete - 1);
  const isFolderItemVisible = await page
    .locator(`data-testid=sidebar-folder--${folderId}`)
    .isVisible();
  expect(isFolderItemVisible).toBe(false);
  await reloadPage({ page });
  const isFolderItemVisible1 = await page
    .locator(`data-testid=sidebar-folder--${folderId}`)
    .isVisible();
  expect(isFolderItemVisible1).toBe(false);
};
