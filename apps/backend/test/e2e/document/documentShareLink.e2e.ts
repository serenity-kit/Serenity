import { expect, test } from "@playwright/test";
import sodium from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../../src/database/prisma";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { login } from "../../helpers/e2e/login";

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

test.beforeAll(async () => {
  await sodium.ready;
  user1.data = await createUserWithWorkspace({
    id: user1.id,
    username: user1.username,
    password: user1.password,
  });
});

test.describe("Edit document", () => {
  test("Create share link", async ({ browser, page }) => {
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });
    const numLinksBefore = await prisma.documentShareLink.count();
    await page.locator("data-testid=document-share-button").click();
    await delayForSeconds(1);

    await page
      .locator("data-testid=document-share-modal__create-share-link-button")
      .click();
    await delayForSeconds(1);

    const numLinksAfter = await prisma.documentShareLink.count();
    expect(numLinksAfter).toBe(numLinksBefore + 1);
    const shareLink = await page
      .locator("data-testid=document-share-modal__share-link-text")
      .textContent();
    if (!shareLink) {
      throw new Error("Share link not found");
    }
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto(shareLink);

    const hasDecriptionError = await page
      .locator("data-testid=document-share-error")
      .isVisible();
    expect(hasDecriptionError).toBe(false);
  });
});
