import { expect, Page } from "@playwright/test";
import { e2eRegisterUser } from "../authentication/e2eRegisterUser";
import { delayForSeconds } from "../delayForSeconds";

export type Props = {
  page: Page;
  username: string;
  password: string;
  workspaceName: string;
};
export const register = async (
  page: Page,
  username: string,
  password: string,
  workspaceName: string
) => {
  await page.goto("http://localhost:3000/register");
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
