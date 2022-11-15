import { expect, Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
  filePath: string;
};
export const uploadImage = async ({ page, filePath }: Props) => {
  const numImagesBefore = await page
    .locator("div[class='ProseMirror'] > img")
    .count();
  // await page.locator('[data-testid="editor-sidebar__add-image"]').click();
  // await delayForSeconds(2);
  // await page
  //   .locator('[data-testid="editor-sidebar__add-image"]')
  //   .setInputFiles(filePath);
  const identifier =
    '//input[@data-testid="editor-sidebar__add-image--file-input"]';
  // await page.locator(identifier).click();
  await delayForSeconds(2);
  await page.setInputFiles(identifier, [filePath]);
  await delayForSeconds(20);
  const numImagesAfter = await page
    .locator("div[class='ProseMirror'] > img")
    .count();
  expect(numImagesAfter).toBe(numImagesBefore + 1);
  return numImagesAfter;
};
