import { expect, test } from "@playwright/test";
import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { Role } from "../../../prisma/generated/output";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { createCommentOnHtmlNode } from "../../helpers/e2e/comment/createCommentOnHtmlNode";
import { openCommentsDrawer } from "../../helpers/e2e/comment/openCommentsDrawer";
import { createDocumentShareLink } from "../../helpers/e2e/documentShareLink/createDocumentShareLink";
import { openDocumentShareLinkModal } from "../../helpers/e2e/documentShareLink/openDocumentShareLinkModal";
import { login } from "../../helpers/e2e/login";

type UserData = {
  username: string;
  password: string;
  data: any;
};
let user1: UserData;

test.beforeAll(async () => {
  await sodium.ready;
  user1 = {
    username: `${generateId()}@example.com`,
    password: "password",
    data: undefined,
  };
  user1.data = await createUserWithWorkspace({
    username: user1.username,
    password: user1.password,
  });
});

test.describe("Share links", () => {
  test("editor share link", async ({ browser, page }) => {
    const role = Role.EDITOR;
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });
    await openDocumentShareLinkModal({ page });
    const { sharingUrl } = await createDocumentShareLink({ page, role });
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto(sharingUrl);

    await delayForSeconds(1);

    const pageContent = page.locator("div[class='ProseMirror']");
    const startingContentPage1 = await pageContent.innerHTML();

    const page2Content = page2.locator("div[class='ProseMirror']");
    const startingContentPage2 = await page2Content.innerHTML();

    expect(startingContentPage1.substring(0, 300)).toBe(
      startingContentPage2.substring(0, 300)
    );
  });
  test("commenter share link", async ({ browser, page }) => {
    const role = Role.COMMENTER;
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });
    await openDocumentShareLinkModal({ page });
    const { sharingUrl } = await createDocumentShareLink({ page, role });
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto(sharingUrl);

    await delayForSeconds(1);

    const pageContent = page.locator("div[class='ProseMirror']");
    const startingContentPage1 = await pageContent.innerHTML();

    const page2Content = page2.locator("div[class='ProseMirror']");
    const startingContentPage2 = await page2Content.innerHTML();

    expect(startingContentPage1.substring(0, 300)).toBe(
      startingContentPage2.substring(0, 300)
    );
  });

  test("viewer share link including a created comment", async ({
    browser,
    page,
  }) => {
    const role = Role.VIEWER;
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });

    const header1 = page.locator("//div[contains(@class,'ProseMirror')]//h1");
    const commentText1 = "Change title";
    const comment1 = await createCommentOnHtmlNode({
      page,
      documentId: user1.data.document.id,
      selectElement: header1,
      comment: commentText1,
    });
    if (!comment1) {
      throw new Error("Comment 1 was not created");
    }
    // click somewhere to make sure to remove the bubble menu!
    await page.mouse.click(500, 500);

    await openDocumentShareLinkModal({ page });
    const { sharingUrl } = await createDocumentShareLink({ page, role });
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto(sharingUrl);

    await delayForSeconds(1);

    const pageContent = page.locator("div[class='ProseMirror']");
    const startingContentPage1 = await pageContent.innerHTML();

    const page2Content = page2.locator("div[class='ProseMirror']");
    const startingContentPage2 = await page2Content.innerHTML();

    expect(startingContentPage1.substring(0, 300)).toBe(
      startingContentPage2.substring(0, 300)
    );

    await openCommentsDrawer({ page: page2 });

    const createdCommentText = await page2
      .locator(`data-testid=comment-${comment1.id}__text-content`)
      .innerText();
    expect(createdCommentText).toBe(commentText1);
  });
});
