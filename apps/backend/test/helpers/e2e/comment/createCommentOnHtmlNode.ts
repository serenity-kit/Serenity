import { expect, Locator, Page } from "@playwright/test";
import { prisma } from "../../../../src/database/prisma";
import { delayForSeconds } from "../../delayForSeconds";

export type Props = {
  page: Page;
  documentId: string;
  selectElement: Locator;
  comment: string;
};
export const createCommentOnHtmlNode = async ({
  page,
  documentId,
  selectElement,
  comment,
}: Props) => {
  const numCommentsBefore = await prisma.comment.count({
    where: { documentId },
  });
  selectElement.evaluate((element: any) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection?.removeAllRanges();
    selection?.addRange(range);
  });
  await delayForSeconds(2);
  await page
    .locator("data-testid=bubble-menu__initiate-comment-button")
    .click();
  await delayForSeconds(1);
  const commentInput = page.locator(
    "data-testid=bubble-menu__create-comment-input"
  );
  await commentInput.type(comment);
  await page.locator("data-testid=bubble-menu__save-comment-button").click();
  await delayForSeconds(2);
  const numCommentsAfter = await prisma.comment.count({
    where: { documentId },
  });
  expect(numCommentsAfter).toBe(numCommentsBefore + 1);
  const createdComment = await prisma.comment.findFirst({
    where: { documentId },
    orderBy: { createdAt: "desc" },
  });
  if (!createdComment) {
    throw new Error("Comment not created");
  }
  const createdCommentText = await page
    .locator(`data-testid=comment-${createdComment.id}__text-content`)
    .innerText();
  expect(createdCommentText).toBe(comment);
  return createdComment;
};
