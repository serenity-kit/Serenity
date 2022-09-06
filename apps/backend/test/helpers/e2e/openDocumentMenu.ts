import { Page } from "@playwright/test";
import { hoverOnElement } from "./hoverOnElement";

export const openDocumentMenu = async (page: Page, documentId: string) => {
  const documentItem = page.locator(
    `data-testid=sidebar-document--${documentId}`
  );
  await hoverOnElement(page, documentItem, true);
  const menuButton = page.locator(
    `data-testid=sidebar-document-menu--${documentId}__open`
  );
  await hoverOnElement(page, menuButton, false);
  await menuButton.click();
};
