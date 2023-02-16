import { Page } from "@playwright/test";
import { prisma } from "../../../../src/database/prisma";

export type Props = {
  page: Page;
  commentId: string;
  replyText: string;
};

export const createCommentReply = async ({
  page,
  commentId,
  replyText,
}: Props) => {
  const numCommentRepliesBefore = await prisma.commentReply.count({
    where: { commentId: commentId },
  });
  const commentReplyText = "I agree";
  const commentReplyInput = page.locator(
    `[data-testid="comment-${commentId}__reply-input]`
  );
  await commentReplyInput.selectText();
  await commentReplyInput.press("Backspace");
  await commentReplyInput.type(replyText);
  await page
    .locator(`[data-testid="comment-${commentId}__save-reply-button"]`)
    .click();
  const numCommentRepliesAfter = await prisma.commentReply.count({
    where: { commentId: commentId },
  });
  expect(numCommentRepliesAfter).toBe(numCommentRepliesBefore + 1);
  const commentReply = await prisma.commentReply.findFirst({
    where: { commentId: commentId },
  });
  return commentReply;
};
