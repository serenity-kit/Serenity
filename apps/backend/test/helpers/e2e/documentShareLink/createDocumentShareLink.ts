import { expect, Page } from "@playwright/test";
import { Role } from "../../../../prisma/generated/output";
import { prisma } from "../../../../src/database/prisma";
import { getRoleAsString } from "../../../../src/utils/getRoleAsString";
import { delayForSeconds } from "../../delayForSeconds";
import { selectValueFromOptions } from "../utils/selectValueFromOptions";

export type Props = {
  page: Page;
  role: Role;
};
export const createDocumentShareLink = async ({ page, role }: Props) => {
  const roleAsString = getRoleAsString(role);
  if (!roleAsString) {
    throw new Error("Invalid role");
  }
  await selectValueFromOptions({
    page,
    testID: "document-share-modal__select-role-menu",
    value: roleAsString,
  });
  const numLinksBefore = await prisma.documentShareLink.count();
  await page
    .locator("data-testid=document-share-modal__create-share-link-button")
    .click();
  await delayForSeconds(1);
  const numLinksAfter = await prisma.documentShareLink.count();
  expect(numLinksAfter).toBe(numLinksBefore + 1);
  const sharingUrl = await page
    .locator("data-testid=document-share-modal__share-link-text")
    .textContent();
  if (!sharingUrl) {
    throw new Error("Share link not found");
  }
  const token = sharingUrl.split("/").pop();
  const documentShareLink = await prisma.documentShareLink.findFirst({
    where: { token },
  });
  return {
    sharingUrl,
    documentShareLink,
  };
};
