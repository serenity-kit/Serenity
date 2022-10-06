import { Page } from "@playwright/test";
import { createWorkspaceOnOnboarding } from "./createWorkspaceOnboarding";
import { registerWithoutOnboarding } from "./registerWithoutOnboarding";

export type Props = {
  page: Page;
  username: string;
  password: string;
  workspaceName: string;
};
export const e2eRegisterUser = async ({
  page,
  username,
  password,
  workspaceName,
}: Props) => {
  await registerWithoutOnboarding({
    page,
    username,
    password,
  });
  const registrationResult = await createWorkspaceOnOnboarding({
    page,
    username,
    workspaceName,
  });
  return registrationResult;
};
