import { expect, Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { formatFolder } from "../../../src/types/folder";
import { delayForSeconds } from "../delayForSeconds";
import { reloadPage } from "./reloadPage";

export const createRootFolder = async (
  page: Page,
  name: string,
  workspaceId: string
) => {
  const numFoldersBeforeAdd = await prisma.folder.count({
    where: { workspaceId },
  });
  await page.locator("data-testid=root-create-folder").click();
  await page.locator(`data-testid=sidebar-folder__edit-name`).fill(name);
  await page.locator(`data-testid=sidebar-folder__edit-name`).press("Enter");
  await delayForSeconds(3);
  const numFoldersAfterAdd = await prisma.folder.count({
    where: { workspaceId },
  });
  expect(numFoldersAfterAdd).toEqual(numFoldersBeforeAdd + 1);
  const folder = await prisma.folder.findFirst({
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
  let folderItemText1: string | null = null;
  const maxSecondsWait = 5;
  let numSecondsWait = 0;
  do {
    await delayForSeconds(1);
    folderItemText1 = await folderItem1.textContent();
    numSecondsWait += 1;
  } while (
    folderItemText1 == "decrypting..." &&
    numSecondsWait <= maxSecondsWait
  );
  expect(folderItemText1).toBe(name);
  return formatFolder(folder);
};
