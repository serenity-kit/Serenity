import { expect, Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { delayForSeconds } from "../delayForSeconds";
import { expandFolderTree } from "./expandFolderTree";
import { openDocumentMenu } from "./openDocumentMenu";
import { reloadPage } from "./reloadPage";

export const deleteDocument = async (
  page: Page,
  documentId: string,
  workspaceId: string
) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId },
  });
  expect(document).not.toBe(null);
  const parentFolder = await prisma.folder.findFirst({
    where: { id: document?.parentFolderId! },
  });
  expect(parentFolder).not.toBe(null);
  await expandFolderTree(page, parentFolder?.id!);
  await openDocumentMenu(page, documentId);
  const numDocumentsBeforeDelete = await prisma.document.count({
    where: { workspaceId },
  });
  await page
    .locator(`[data-testid=sidebar-document-menu--${documentId}__delete]`)
    .click();
  await page.locator('div[role="button"]:has-text("Delete page")').click();
  await delayForSeconds(2);
  const numDocumentsAfterDelete = await prisma.document.count({
    where: { workspaceId },
  });
  expect(numDocumentsAfterDelete).toBe(numDocumentsBeforeDelete - 1);
  const isDocumentItemVisible = await page
    .locator(`data-testid=sidebar-folder--${documentId}`)
    .isVisible();
  expect(isDocumentItemVisible).toBe(false);
  await reloadPage({ page });
  const isDocumentItemVisible2 = await page
    .locator(`data-testid=sidebar-folder--${documentId}`)
    .isVisible();
  expect(isDocumentItemVisible2).toBe(false);
};
