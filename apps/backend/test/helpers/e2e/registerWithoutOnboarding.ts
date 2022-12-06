import { expect, Page } from "@playwright/test";
import { prisma } from "../../../src/database/prisma";
import { fillRegisterForm } from "./fillRegisterForm";
import { verifyRegistration } from "./verifyRegistration";

export type Props = {
  page: Page;
  username: string;
  password: string;
};
export const registerWithoutOnboarding = async ({
  page,
  username,
  password,
}: Props) => {
  const { confirmationCode } = await fillRegisterForm({
    page,
    username,
    password,
  });
  await verifyRegistration({ page, confirmationCode });
  await expect(page).toHaveURL("http://localhost:19006/onboarding");
  const user = await prisma.user.findFirst({
    where: { username },
  });
  const mainDevice = await prisma.device.findUnique({
    where: { signingPublicKey: user?.mainDeviceSigningPublicKey },
  });
  return {
    user,
    mainDevice,
  };
};
