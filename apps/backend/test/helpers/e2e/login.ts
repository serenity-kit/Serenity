import { Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";
import { e2eLoginUser } from "./e2eLoginUser";

export type Prop = {
  page: Page;
  username: string;
  password: string;
  stayLoggedIn?: boolean;
};
export const login = async ({ page, username, password, stayLoggedIn }) => {
  await page.goto("http://localhost:19006/login");
  await delayForSeconds(2);
  return e2eLoginUser({ page, username, password, stayLoggedIn });
};
