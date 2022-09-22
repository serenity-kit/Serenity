import { Page } from "@playwright/test";
import { e2eLoginUser } from "../authentication/e2eLoginUser";
import { delayForSeconds } from "../delayForSeconds";

export const login = async (
  page: Page,
  username: string,
  password: string,
  stayLoggedIn?: boolean
) => {
  await page.goto("http://localhost:3000/login");
  await delayForSeconds(2);
  return e2eLoginUser({ page, username, password, stayLoggedIn });
};
