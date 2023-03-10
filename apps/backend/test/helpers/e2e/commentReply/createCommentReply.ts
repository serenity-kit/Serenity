import { expect, Page } from "@playwright/test";
import { prisma } from "../../../../src/database/prisma";
import { delayForSeconds } from "../../delayForSeconds";

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
  const commentReplyInput = page.locator(
    `data-testid=comment-${commentId}__reply-input`
  );
  await commentReplyInput.selectText();
  await commentReplyInput.press("Backspace");
  await commentReplyInput.type(replyText);
  await page
    .locator(`data-testid=comment-${commentId}__save-reply-button`)
    .click();
  await delayForSeconds(2);
  const numCommentRepliesAfter = await prisma.commentReply.count({
    where: { commentId: commentId },
  });
  expect(numCommentRepliesAfter).toBe(numCommentRepliesBefore + 1);
  const commentReply = await prisma.commentReply.findFirst({
    where: { commentId: commentId },
    orderBy: { createdAt: "desc" },
  });
  if (!commentReply) {
    throw new Error("Comment reply not created");
  }
  const commentReplyText = await page
    .locator(
      `data-testid=comment-${commentId}__comment-reply-${commentReply.id}--text-content`
    )
    .innerText();
  expect(commentReplyText).toBe(replyText);
  return commentReply;
};
