import { expect, test } from "@playwright/test";
import sodium from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { login } from "../../helpers/e2e/login";
import { logout } from "../../helpers/e2e/logout";
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

test.describe("Edit document", () => {
  test("Add content", async ({ page }) => {
    const newContent = "\nHello World!";
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });
    const editor = page.locator("div[class='ProseMirror']");
    const startingContent = await editor.innerHTML();
    await page.type("div[class='ProseMirror']", newContent);
    await delayForSeconds(2);
    await reloadPage({ page });
    await delayForSeconds(2);
    const endingContent = await editor.innerHTML();
    expect(startingContent).not.toBe(endingContent);
    await logout({ page });
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });
    await delayForSeconds(2); // wait a bit until the editor loads
    const editorAfterLogin = page.locator("div[class='ProseMirror']");
    const afterLoginContent = await editorAfterLogin.innerHTML();
    expect(afterLoginContent).toBe(endingContent);
  });
});
