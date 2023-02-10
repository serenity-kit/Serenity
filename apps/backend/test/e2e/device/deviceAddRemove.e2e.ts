import { expect, test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import createUserWithWorkspace from "../../../src/database/testHelpers/createUserWithWorkspace";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { e2eLoginUser } from "../../helpers/e2e/e2eLoginUser";
import { openDevicesPanel } from "../../helpers/e2e/openDevicesPanel";

test.describe("Devices", () => {
  let workspaceInvitationUrl = "";
  let sharedWorkspaceId = "";

  test("User can log in from two devices", async ({ browser, page }) => {
    const userId = uuidv4();
    const username = `${uuidv4()}@example.com`;
    const password = "pass";
    const { workspace, document } = await createUserWithWorkspace({
      id: userId,
      username,
      password,
    });
    sharedWorkspaceId = workspace.id;
    await delayForSeconds(2);
    // const workspaceName = "sharable";
    // await page.goto("http://localhost:19006/register");
    // await registerOnPage({ page, username, password, workspaceName });
    await page.goto("http://localhost:19006/login");
    await e2eLoginUser({ page, username, password });
    await delayForSeconds(2);
    await expect(page).toHaveURL(
      `http://localhost:19006/workspace/${workspace.id}/page/${document.id}`
    );
    await openDevicesPanel(page);
    await delayForSeconds(200);
    const devices1BeforeLogin = page.locator(
      `//div[@data-testid="devices-list"]/div`
    );
    console.log({ devices1BeforeLogin });
    const numDevices1BeforeLogin = await devices1BeforeLogin.count();
    expect(numDevices1BeforeLogin).toBe(2);

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto("http://localhost:19006/login");

    // go to devices page for each user.
    // each user should not be able to delete their own device.
    await openDevicesPanel(page2);

    const devices1 = page.locator(`//div[@data-testid="devices-list"]/div`);
    const devices2 = page2.locator(`//div[@data-testid="devices-list"]/div`);
    const numDevices1 = await devices1.count();
    const numDevices2 = await devices2.count();

    expect(numDevices1).toBe(numDevices1BeforeLogin + 1);
    expect(numDevices1).toBe(numDevices2);
    // TODO: check that two of the devices (main and one other) are not removable
    // TODO: delete a device from page1 and reload page2
  });
});
