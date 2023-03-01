import { expect, test } from "@playwright/test";
import sodium from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
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
  id: string;
  username: string;
  password: string;
  data: any;
};
const user1: UserData = {
  id: uuidv4(),
  username: `${uuidv4()}@example.com`,
  password: "password",
  data: undefined,
};
const user2: UserData = {
  id: uuidv4(),
  username: `${uuidv4()}@example.com`,
  password: "password",
  data: undefined,
};

test.beforeAll(async () => {
  await sodium.ready;
  user1.data = await createUserWithWorkspace({
    id: user1.id,
    username: user1.username,
    password: user1.password,
  });
});

test.use({ video: "retain-on-failure" });

test.describe("create a comment", () => {
  test("Add content", async ({ page }) => {
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
});

test.describe("comment replies, delete comment", () => {
  test("Add content", async ({ browser }) => {
    const context = await browser.newContext({
      recordVideo: {
        dir: "./videos",
      },
    });
    const page = await context.newPage();

    const commentText1 = "Change title";
    const commentText2 = "More lists";
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });
    const header1 = page.locator("//div[contains(@class,'ProseMirror')]//h1");
    const header2 = page.locator(
      "//div[contains(@class,'ProseMirror')]//h2[2]"
    );
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
    const commentReply1Content = await page
      .locator(
        `[data-testid='comment-${comment1.id}__comment-reply-${commentReply1.id}--text-content']`
      )
      .innerText();
    const commentReply2Content = await page
      .locator(
        `[data-testid='comment-${comment1.id}__comment-reply-${commentReply2.id}--text-content']`
      )
      .innerText();
    // await delayForSeconds(20);
    expect(commentReply1Content).toBe(commentReply1Text);
    expect(commentReply2Content).toBe(commentReply2Text);
    // delete a comment with no replies
    await deleteComment({
      page,
      commentId: comment2.id,
    });
    // delete the comment with replies
    await deleteComment({
      page,
      commentId: comment1.id,
    });
    const numCommentsAfterDeletes = await prisma.comment.count({
      where: { documentId: user1.data.document.id },
    });
    expect(numCommentsAfterDeletes).toBe(1);
  });
});
