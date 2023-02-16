import { test } from "@playwright/test";
import sodium from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
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
    await page.goto("http://localhost:19006/register");
    // const { user } = await e2eRegisterUser({
    //   page,
    //   username: user1.username,
    //   password: user1.password,
    //   workspaceName: "workspace",
    // });
    await login({
      page,
      username: user1.username,
      password: user1.password,
      stayLoggedIn: true,
    });
    const header = page.locator("div[class='ProseMirror']");

    // const header = editor.locator(".//h1");
    // select text inside the editor
    header.evaluate((element) => {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      selection?.removeAllRanges();
      selection?.addRange(range);
    });

    await delayForSeconds(20);

    // const startingContent = await editor.innerHTML();
    // await page.type("div[class='ProseMirror']", newContent);
    // await delayForSeconds(2);
    // await reloadPage({ page });
    // await delayForSeconds(2);
    // const endingContent = await editor.innerHTML();
    // expect(startingContent).not.toBe(endingContent);
    // await logout({ page });
    // await login({
    //   page,
    //   username: user1.username,
    //   password: user1.password,
    //   stayLoggedIn: true,
    // });
    // await delayForSeconds(2); // wait a bit until the editor loads
    // const editorAfterLogin = page.locator("div[class='ProseMirror']");
    // const afterLoginContent = await editorAfterLogin.innerHTML();
    // expect(afterLoginContent).toBe(endingContent);
  });
});
