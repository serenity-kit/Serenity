import { expect, test } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { delayForSeconds } from "../../helpers/delayForSeconds";
import { e2eLoginUser } from "../../helpers/e2e/e2eLoginUser";
import { e2eRegisterUser } from "../../helpers/e2e/e2eRegisterUser";
import { openDevicesPanel } from "../../helpers/e2e/openDevicesPanel";
import { reloadPage } from "../../helpers/e2e/reloadPage";
import { verifyPassword } from "../../helpers/e2e/verifyPassword";

test.describe("Devices", () => {
  test("User can log in from two devices", async ({ browser, page }) => {
    const username = `${uuidv4()}@example.com`;
    const password = "pass";
    await page.goto("http://localhost:19006/register");
    const { workspace, document } = await e2eRegisterUser({
      page,
      username,
      password,
      workspaceName: "workspace",
    });
    await delayForSeconds(2);
    await expect(page).toHaveURL(
      `http://localhost:19006/workspace/${workspace!.id}/page/${document!.id}`
    );
    await openDevicesPanel(page);
    const devices1BeforeLogin = page.locator(
      `//div[@data-testid="devices-list"]/div`
    );
    const numDevices1BeforeLogin = await devices1BeforeLogin.count();
    expect(numDevices1BeforeLogin).toBe(3); // header, main, and one other

    const deletablesBeforeSecondLogin = page.locator(
      `//div[@data-testid="devices-list"]/div//div[@role="button"]`
    );
    const numDeletablesBeforeSecondLogin =
      await deletablesBeforeSecondLogin.count();
    expect(numDeletablesBeforeSecondLogin).toBe(0);

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto("http://localhost:19006/login");
    await e2eLoginUser({ page: page2, username, password });

    // go to devices page for each user.
    // each user should not be able to delete their own device.
    await openDevicesPanel(page2);

    await reloadPage({ page });
    const devices1 = page.locator(`//div[@data-testid="devices-list"]/div`);
    const devices2 = page2.locator(`//div[@data-testid="devices-list"]/div`);
    const numDevices1 = await devices1.count();
    const numDevices2 = await devices2.count();

    expect(numDevices1).toBe(numDevices1BeforeLogin + 1);
    expect(numDevices1).toBe(numDevices2);

    // check that two of the devices (main and one other) are not removable

    const deletablesBeforeDeleting = page.locator(
      `//div[@data-testid="devices-list"]/div//div[@role="button"]`
    );
    const numDeletablesBeforeDeleting = await deletablesBeforeDeleting.count();
    expect(numDeletablesBeforeDeleting).toBe(1);

    // the second device should be the one that was just added
    // delete a device from page1 and reload page2
    await devices1
      .nth(numDevices1 - 1)
      .locator('//div[@role="button"]')
      .click();

    await verifyPassword({ page, password, throwIfNotOpen: false });

    await reloadPage({ page: page2 });
    await delayForSeconds(2);

    await expect(page2).toHaveURL(`http://localhost:19006/login`);

    const deletablesAfterDeleting = page.locator(
      `//div[@data-testid="devices-list"]/div//div[@role="button"]`
    );
    const numDeletablesAfterDeleting = await deletablesAfterDeleting.count();
    expect(numDeletablesAfterDeleting).toBe(0);
  });
});
