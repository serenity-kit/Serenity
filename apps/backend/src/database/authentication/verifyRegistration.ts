import { PrismaClient } from "@prisma/client";
import * as userChain from "@serenity-kit/user-chain";
import { UserInputError } from "apollo-server-express";
import { Prisma, UnverifiedUser } from "../../../prisma/generated/output";
import { createConfirmationCode } from "../../utils/confirmationCode";
import { prisma } from "../prisma";

export const MAX_UNVERIFIED_USER_CONFIRMATION_ATTEMPTS = 5;

const resetConfirmationCode = async (
  prisma: PrismaClient,
  username: string
) => {
  const confirmationCode = createConfirmationCode();
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

const setConfirmationTryCounter = async (
  prisma: PrismaClient,
  username: string,
  count: number
) => {
  await prisma.unverifiedUser.updateMany({
    where: { username },
    data: { confirmationTryCounter: count },
  });
};

const createDevicesAndUser = async (
  prisma: Prisma.TransactionClient,
  unverifiedUser: UnverifiedUser
) => {
  const device = await prisma.device.create({
    data: {
      encryptionPublicKey: unverifiedUser.mainDeviceEncryptionPublicKey,
      signingPublicKey: unverifiedUser.mainDeviceSigningPublicKey,
      encryptionPublicKeySignature:
        unverifiedUser.mainDeviceEncryptionPublicKeySignature,
      info: JSON.stringify({ type: "main" }),
    },
  });

  const createChainEvent = userChain.CreateChainEvent.parse(
    unverifiedUser.createChainEvent
  );
  const userChainState = userChain.resolveState({
    events: [createChainEvent],
    knownVersion: userChain.version,
  });

  const user = await prisma.user.create({
    data: {
      username: unverifiedUser.username,
      registrationRecord: unverifiedUser.registrationRecord,
      mainDeviceCiphertext: unverifiedUser.mainDeviceCiphertext,
      mainDeviceNonce: unverifiedUser.mainDeviceNonce,
      mainDeviceSigningPublicKey: unverifiedUser.mainDeviceSigningPublicKey,
      devices: {
        connect: {
          signingPublicKey: device.signingPublicKey,
        },
      },
      pendingWorkspaceInvitationId: unverifiedUser.pendingWorkspaceInvitationId,
      pendingWorkspaceInvitationKeySubkeyId:
        unverifiedUser.pendingWorkspaceInvitationKeySubkeyId,
      pendingWorkspaceInvitationKeyCiphertext:
        unverifiedUser.pendingWorkspaceInvitationKeyCiphertext,
      pendingWorkspaceInvitationKeyPublicNonce:
        unverifiedUser.pendingWorkspaceInvitationKeyPublicNonce,
      chain: {
        create: {
          content: createChainEvent,
          state: userChainState,
          position: 0,
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

type Props = {
  username: string;
  confirmationCode: string;
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
      username: username,
    },
  });
  if (existingUserData) {
    throw new Error("This username has already been registered");
  }
  const unverifiedUser = await prisma.unverifiedUser.findFirst({
    where: {
      username,
      confirmationCode,
    },
  });
  if (unverifiedUser) {
    return await prisma.$transaction(async (prisma) => {
      const { user } = await createDevicesAndUser(prisma, unverifiedUser);
      return user;
    });
  }
  const unverifiedUserWithIncorrectConfirmationCode =
    await prisma.unverifiedUser.findFirst({
      where: { username },
    });
  if (!unverifiedUserWithIncorrectConfirmationCode) {
    throw new Error("Invalid user");
  }
  if (
    unverifiedUserWithIncorrectConfirmationCode.confirmationTryCounter >=
    MAX_UNVERIFIED_USER_CONFIRMATION_ATTEMPTS - 1
  ) {
    const updatedUnverifiedUser = await resetConfirmationCode(prisma, username);
    console.log(
      `New user confirmation code: ${updatedUnverifiedUser!.confirmationCode}`
    );
    throw new UserInputError("Too many attempts. Code reset.");
  }
  const newConfirmationTryCounter =
    unverifiedUserWithIncorrectConfirmationCode.confirmationTryCounter + 1;
  await setConfirmationTryCounter(prisma, username, newConfirmationTryCounter);
  const numAttemptsRemaining =
    MAX_UNVERIFIED_USER_CONFIRMATION_ATTEMPTS - newConfirmationTryCounter;
  throw new UserInputError(
    `Invalid confirmation code. ${numAttemptsRemaining} attempts remaining`
  );
}
