import { Page } from "@playwright/test";
import { login } from "./login";
import { register } from "./register";

type RegisterAndLoginProps = {
  page: Page;
  username: string;
  password: string;
  workspaceName: string;
  stayLoggedIn?: boolean;
};
export const registerAndLogin = async ({
  page,
  username,
  password,
  workspaceName,
  stayLoggedIn,
}: RegisterAndLoginProps) => {
  const registerResult = await register({
    page,
    username,
    password,
    workspaceName,
  });
  await login({ page, username, password, stayLoggedIn });
  return registerResult;
};
