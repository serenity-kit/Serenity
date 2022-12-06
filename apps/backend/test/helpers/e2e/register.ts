import { expect, Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";
import { e2eRegisterUser } from "./e2eRegisterUser";

export type Props = {
  page: Page;
  username: string;
  password: string;
  workspaceName: string;
};
export const register = async ({ page, username, password, workspaceName }) => {
  await page.goto("http://localhost:19006/register");
  await delayForSeconds(2);
  const result = await e2eRegisterUser({
    page,
    username,
    password,
    workspaceName,
  });
  expect(result).not.toBeUndefined();
  return result;
};
