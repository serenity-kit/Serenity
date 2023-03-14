import { expect, Page } from "@playwright/test";
import { prisma } from "../../../../src/database/prisma";
import { delayForSeconds } from "../../delayForSeconds";
import { hoverOnElement } from "../hoverOnElement";

export type Props = {
  page: Page;
  commentId: string;
};
export const deleteComment = async ({ page, commentId }: Props) => {
  const commentBeforeDelete = await prisma.comment.findFirst({
    where: { id: commentId },
  });
  if (!commentBeforeDelete) {
    throw new Error("Comment not found");
  }
  const commentElement = page.locator(`data-testid=comment-${commentId}`);
  await hoverOnElement(page, commentElement, false);
  const commentMenuElement = page.locator(
    `data-testid=comment-${commentId}__menu`
  );
  await hoverOnElement(page, commentMenuElement, false);
  await commentMenuElement.click();
  await page.locator(`data-testid=comment-${commentId}__delete-button`).click();
  await delayForSeconds(2);
  const commentAfterDelete = await prisma.comment.findFirst({
    where: { id: commentId },
  });
  if (commentAfterDelete) {
    throw new Error("Comment not deleted");
  }
  const deletedCommentElement = await page.$(
    `data-testid=comment-${commentId}`
  );
  expect(deletedCommentElement).toBe(null);
};
