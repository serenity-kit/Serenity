import { expect, Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { formatFolder } from "../../../src/types/folder";
import { delayForSeconds } from "../delayForSeconds";
import { expandFolderTree } from "./expandFolderTree";
import { openFolderMenu } from "./openFolderMenu";
import { reloadPage } from "./reloadPage";
import { waitForElementTextChange } from "./utils/waitForElementTextChange";

export const createSubFolder = async (
  page: Page,
  parentFolderId: string,
  workspaceId: string
) => {
  const numFoldersBeforeAdd = await prisma.folder.count({
    where: { workspaceId },
  });
  await openFolderMenu(page, parentFolderId);
  await page
    .locator(
      `[data-testid=sidebar-folder-menu--${parentFolderId}__create-subfolder]`
    )
    .click();
  await delayForSeconds(3);
  const numFoldersAfterAdd = await prisma.folder.count({
    where: { workspaceId },
  });
  expect(numFoldersAfterAdd).toBe(numFoldersBeforeAdd + 1);
  const folder = await prisma.folder.findFirstOrThrow({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
  expect(folder).not.toBe(null);
  expect(folder?.parentFolderId).toBe(parentFolderId);
  const newFolderMenu = page.locator(
    `data-testid=sidebar-folder--${folder?.id}`
  );
  expect(newFolderMenu).not.toBe(undefined);
  await delayForSeconds(1);
  const newFolderName = await newFolderMenu.textContent();
  expect(newFolderName).toBe("Untitled");
  await reloadPage({ page });
  await expandFolderTree(page, parentFolderId);
  const newFolderMenu1 = page.locator(
    `data-testid=sidebar-folder--${folder?.id}`
  );
  const newFolderName1 = await waitForElementTextChange({
    element: newFolderMenu1,
    initialText: "loading…",
  });
  expect(newFolderName1).toBe("Untitled");
  return formatFolder(folder);
};
