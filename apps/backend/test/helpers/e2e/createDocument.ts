import { expect, Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../delayForSeconds";
import { expandFolderTree } from "./expandFolderTree";
import { hoverOnElement } from "./hoverOnElement";
import { reloadPage } from "./reloadPage";

export const createDocument = async (
  page: Page,
  parentFolderId: string,
  workspaceId: string
) => {
  const numDocumentsBeforeAdd = await prisma.document.count({
    where: { workspaceId, parentFolderId },
  });
  const folderItem = page.locator(
    `data-testid=sidebar-folder--${parentFolderId}`
  );
  await hoverOnElement(page, folderItem, true);
  await expandFolderTree(page, parentFolderId);
  let createDocumentButton = page.locator(
    `data-testid=sidebar-folder--${parentFolderId}__create-document`
  );
  await hoverOnElement(page, createDocumentButton, false);
  await createDocumentButton.click();
  await delayForSeconds(3);
  const numDocumentsAfterAdd = await prisma.document.count({
    where: { workspaceId, parentFolderId },
  });
  expect(numDocumentsAfterAdd).toBe(numDocumentsBeforeAdd + 1);
  const document = await prisma.document.findFirst({
    where: { workspaceId, parentFolderId },
    orderBy: { createdAt: "desc" },
  });
  expect(document).not.toBe(null);
  await delayForSeconds(1);
  const newDocumentItem = page.locator(
    `data-testid=sidebar-document--${document?.id}`
  );
  const newDocumentName = await newDocumentItem.textContent();
  expect(newDocumentName).toBe("Untitled");
  await reloadPage({ page });
  await expandFolderTree(page, parentFolderId);
  const newDocumentItem1 = page.locator(
    `data-testid=sidebar-document--${document?.id}`
  );
  const newDocumentName1 = await newDocumentItem1.textContent();
  expect(newDocumentName1).toBe("Untitled");
  return document;
};
