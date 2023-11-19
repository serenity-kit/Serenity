import { Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
  username: string;
  password: string;
  stayLoggedIn?: boolean;
};
export const e2eLoginUser = async ({
  page,
  username,
  password,
  stayLoggedIn,
}: Props) => {
  // turn off extended login only if stayLoggedIn is false;
  let doStayLoggedIn = true;
  if (stayLoggedIn === false) {
    doStayLoggedIn = stayLoggedIn;
  }
  // Fill username input
  await page
    .locator(
      'text=EmailPasswordStay logged in for 30 daysLog in >> [placeholder="Enter your email …"]'
    )
    .fill(username);

  // Fill password input
  await page
    .locator(
      'text=EmailPasswordStay logged in for 30 daysLog in >> [placeholder="Enter your password …"]'
    )
    .fill(password);

  if (!doStayLoggedIn) {
    await page.locator("text=Stay logged in for 30 days").click();
  }

  // Click "Log in" button
  await page.locator('button:has-text("Log in")').click();
  await delayForSeconds(2);
};
