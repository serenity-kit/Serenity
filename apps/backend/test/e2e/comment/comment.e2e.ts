import { expect, test } from "@playwright/test";
import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { prisma } from "../../../src/database/prisma";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { createCommentOnHtmlNode } from "../../helpers/e2e/comment/createCommentOnHtmlNode";
import { deleteComment } from "../../helpers/e2e/comment/deleteComment";
import { openCommentsDrawer } from "../../helpers/e2e/comment/openCommentsDrawer";
import { createCommentReply } from "../../helpers/e2e/commentReply/createCommentReply";
import { login } from "../../helpers/e2e/login";
import { reloadPage } from "../../helpers/e2e/reloadPage";

type UserData = {
  username: string;
  password: string;
  data: any;
};
let user1: UserData;
let user2: UserData;

test.beforeAll(async () => {
  await sodium.ready;
  user1 = {
    username: `${generateId()}@example.com`,
    password: "password",
    data: undefined,
  };
  user2 = {
    username: `${generateId()}@example.com`,
    password: "password",
    data: undefined,
  };
  user1.data = await createUserWithWorkspace({
    username: user1.username,
    password: user1.password,
  });
});

test.use({ video: "retain-on-failure" });

test("create a comment", async ({ page }) => {
  const comment = "First!";
  await login({
    page,
    username: user1.username,
    password: user1.password,
    stayLoggedIn: true,
  });
  const header = page.locator("//div[contains(@class,'ProseMirror')]//h2[1]");
  await createCommentOnHtmlNode({
    page,
    documentId: user1.data.document.id,
    selectElement: header,
    comment,
  });
});

test("comment replies, delete comment", async ({ page }) => {
  const commentText1 = "Change title";
  const commentText2 = "More lists";
  await login({
    page,
    username: user1.username,
    password: user1.password,
    stayLoggedIn: true,
  });
  const header1 = page.locator("//div[contains(@class,'ProseMirror')]//h1");
  const header2 = page.locator("//div[contains(@class,'ProseMirror')]//h2[2]");
  const comment1 = await createCommentOnHtmlNode({
    page,
    documentId: user1.data.document.id,
    selectElement: header1,
    comment: commentText1,
  });
  if (!comment1) {
    throw new Error("Comment 1 was not created");
  }
  const comment2 = await createCommentOnHtmlNode({
    page,
    documentId: user1.data.document.id,
    selectElement: header2,
    comment: commentText2,
  });
  if (!comment2) {
    throw new Error("Comment 1 was not created");
  }
  const numCommentsBeforeDeletes = await prisma.comment.count({
    where: { documentId: user1.data.document.id },
  });
  await openCommentsDrawer({ page });
  const commentReply1Text = "Reply to comment 1";
  const commentReply2Text = "2nd reply to comment 1";
  const commentReply1 = await createCommentReply({
    page,
    commentId: comment1.id,
    replyText: commentReply1Text,
  });
  if (!commentReply1) {
    throw new Error("Comment reply was not created");
  }
  const commentReply2 = await createCommentReply({
    page,
    commentId: comment1.id,
    replyText: commentReply2Text,
  });
  if (!commentReply2) {
    throw new Error("Comment reply was not created");
  }
  await delayForSeconds(1);
  await reloadPage({ page });
  await openCommentsDrawer({ page });
  await page.locator(`data-testid=comment-${comment1.id}`).click();

  const commentReply1Content = await page
    .locator(
      `data-testid=comment-${comment1.id}__comment-reply-${commentReply1.id}--text-content`
    )
    .innerText();
  const commentReply2Content = await page
    .locator(
      `data-testid=comment-${comment1.id}__comment-reply-${commentReply2.id}--text-content`
    )
    .innerText();
  // await delayForSeconds(20);
  expect(commentReply1Content).toBe(commentReply1Text);
  expect(commentReply2Content).toBe(commentReply2Text);
  // delete the comment with replies
  await deleteComment({
    page,
    commentId: comment1.id,
  });
  // delete a comment with no replies
  await page.locator(`data-testid=comment-${comment2.id}`).click();
  await deleteComment({
    page,
    commentId: comment2.id,
  });
  const numCommentsAfterDeletes = await prisma.comment.count({
    where: { documentId: user1.data.document.id },
  });
  expect(numCommentsAfterDeletes).toBe(numCommentsBeforeDeletes - 2);
});
