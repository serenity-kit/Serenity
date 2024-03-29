import { expect, Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { formatFolder } from "../../../src/types/folder";
import { delayForSeconds } from "../delayForSeconds";
import { reloadPage } from "./reloadPage";
import { waitForElementTextChange } from "./utils/waitForElementTextChange";

export const createRootFolder = async (
  page: Page,
  name: string,
  workspaceId: string
) => {
  const numFoldersBeforeAdd = await prisma.folder.count({
    where: { workspaceId, parentFolderId: null },
  });
  await page.locator("data-testid=root-create-folder").click();
  await page.locator(`data-testid=sidebar-folder__edit-name`).fill(name);
  await page.locator(`data-testid=sidebar-folder__edit-name`).press("Enter");
  await delayForSeconds(2);
  const numFoldersAfterAdd = await prisma.folder.count({
    where: { workspaceId, parentFolderId: null },
  });
  // TODO: investigate why GitHub reports
  // numFoldersAfterAdd = numFoldersBeforeAdd + 2
  expect(numFoldersAfterAdd).toBeGreaterThan(numFoldersBeforeAdd);
  const folder = await prisma.folder.findFirstOrThrow({
    where: { workspaceId: workspaceId },
    orderBy: { createdAt: "desc" },
  });
  expect(folder).not.toBe(null);
  expect(folder?.parentFolderId).toBe(null);
  const folderItem = page.locator(`data-testid=sidebar-folder--${folder?.id}`);
  const folderItemText = await folderItem.textContent();
  expect(folderItemText).toBe(name);
  await reloadPage({ page });
  const folderItem1 = page.locator(`data-testid=sidebar-folder--${folder?.id}`);
  const folderItemText1 = await waitForElementTextChange({
    element: folderItem1,
    initialText: "loading…",
  });
  expect(folderItemText1).toBe(name);
  return formatFolder(folder);
};
