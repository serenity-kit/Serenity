import { prisma } from "../prisma";
import { createConfirmationCode } from "../../utils/confirmationCode";
import { Prisma } from "../../../prisma/generated/output";

export const MAX_UNVERIFIED_USER_CONFIRMATION_ATTEMPTS = 5;

type Props = {
  username: string;
  confirmationCode: string;
};

const resetConfirmationCode = async (username: string) => {
  const confirmationCode = await createConfirmationCode();
  await prisma.unverifiedUser.updateMany({
    where: {
      username,
    },
    data: {
      confirmationCode,
      confirmationTryCounter: 0,
    },
  });
  const updatedUnverifiedUser = await prisma.unverifiedUser.findFirst({
    where: { username },
  });
  return updatedUnverifiedUser;
};

const setConfirmationTryCounter = async (username: string, count: number) => {
  await prisma.unverifiedUser.updateMany({
    where: {
      username,
    },
    data: {
      confirmationTryCounter: count,
    },
  });
};

const createDevicesAndUser = async (unverifiedUser) => {
  const device = await prisma.device.create({
    data: {
      encryptionPublicKey: unverifiedUser.mainDeviceSigningPublicKey,
      signingPublicKey: unverifiedUser.mainDeviceSigningPublicKey,
      encryptionPublicKeySignature:
        unverifiedUser.mainDeviceEncryptionPublicKeySignature,
      info: JSON.stringify({ type: "main" }),
    },
  });

  const user = await prisma.user.create({
    data: {
      username: unverifiedUser.username,
      opaqueEnvelope: unverifiedUser.opaqueEnvelope,
      mainDeviceCiphertext: unverifiedUser.mainDeviceCiphertext,
      mainDeviceNonce: unverifiedUser.mainDeviceNonce,
      mainDeviceSigningPublicKey: unverifiedUser.mainDeviceSigningPublicKey,
      mainDeviceEncryptionKeySalt: unverifiedUser.mainDeviceEncryptionKeySalt,
      devices: {
        connect: {
          signingPublicKey: device.signingPublicKey,
        },
      },
    },
  });
  await prisma.unverifiedUser.delete({
    where: {
      id: unverifiedUser.id,
    },
  });
  return {
    device,
    user,
  };
};

// NOTE: we can force a login for this user before they confirm their account
// if we modify the login to check for unverifiedUser
export async function verifyRegistration({
  username,
  confirmationCode,
}: Props) {
  // if this user has already completed registration, throw an error
  const existingUserData = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (existingUserData) {
    throw Error("This username has already been registered");
  }
  return await prisma.$transaction(async (prisma) => {
    const unverifiedUser = await prisma.unverifiedUser.findFirst({
      where: {
        username,
        confirmationCode,
      },
    });
    if (unverifiedUser) {
      const { user } = await createDevicesAndUser(unverifiedUser);
      return user;
    } else {
      const anyUnverifiedUser = await prisma.unverifiedUser.findFirst({
        where: {
          username,
        },
      });
      if (!anyUnverifiedUser) {
        throw new Error("Invalid user");
      }
      if (
        anyUnverifiedUser.confirmationTryCounter >=
        MAX_UNVERIFIED_USER_CONFIRMATION_ATTEMPTS - 1
      ) {
        const updatedUnverifiedUser = await resetConfirmationCode(username);
        // TODO: send an email to the user's email address
        console.log(
          `New user confirmation code: ${
            updatedUnverifiedUser!.confirmationCode
          }`
        );
        throw new Error("Invalid confirmation code. Code reset.");
      } else {
        const newConfirmationTryCounter =
          anyUnverifiedUser.confirmationTryCounter + 1;
        await setConfirmationTryCounter(username, newConfirmationTryCounter);
        const numAttemptsRemaining =
          MAX_UNVERIFIED_USER_CONFIRMATION_ATTEMPTS - newConfirmationTryCounter;
        throw new Error(
          `Invalid confirmation code. ${numAttemptsRemaining} attempts remaining`
        );
      }
    }
  });
}
