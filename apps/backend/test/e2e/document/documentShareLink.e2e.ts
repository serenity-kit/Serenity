import { expect, test } from "@playwright/test";
import { generateId } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { Role } from "../../../prisma/generated/output";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
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

    const hasDecriptionError = await page
      .locator("data-testid=document-share-error")
      .isVisible();
    expect(hasDecriptionError).toBe(false);
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

    const hasDecriptionError = await page
      .locator("data-testid=document-share-error")
      .isVisible();
    expect(hasDecriptionError).toBe(false);
  });

  test("viewer share link", async ({ browser, page }) => {
    const role = Role.VIEWER;
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

    const hasDecriptionError = await page
      .locator("data-testid=document-share-error")
      .isVisible();
    expect(hasDecriptionError).toBe(false);
  });
});
