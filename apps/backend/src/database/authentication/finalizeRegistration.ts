import * as sodium from "@serenity-tools/libsodium";
import { UserInputError } from "apollo-server-express";
import { Device } from "../../types/device";
import { createConfirmationCode } from "../../utils/confirmationCode";
import { ExpectedGraphqlError } from "../../utils/expectedGraphqlError/expectedGraphqlError";
import { prisma } from "../prisma";

type DeviceInput = Device & {
  ciphertext: string;
  nonce: string;
  encryptionKeySalt: string;
};

type Props = {
  username: string;
  opaqueEnvelope: string;
  mainDevice: DeviceInput;
  pendingWorkspaceInvitationId: string | null | undefined;
  pendingWorkspaceInvitationKeySubkeyId: number | null | undefined;
  pendingWorkspaceInvitationKeyCiphertext: string | null | undefined;
  pendingWorkspaceInvitationKeyPublicNonce: string | null | undefined;
  pendingWorkspaceInvitationKeyEncryptionSalt: string | null | undefined;
};

const verifyDevice = (device: DeviceInput) => {
  return sodium.crypto_sign_verify_detached(
    device.encryptionPublicKeySignature,
    device.encryptionPublicKey,
    device.signingPublicKey
  );
};

export async function finalizeRegistration({
  username,
  opaqueEnvelope,
  mainDevice,
  pendingWorkspaceInvitationId,
  pendingWorkspaceInvitationKeySubkeyId,
  pendingWorkspaceInvitationKeyCiphertext,
  pendingWorkspaceInvitationKeyPublicNonce,
  pendingWorkspaceInvitationKeyEncryptionSalt,
}: Props) {
  if (!verifyDevice(mainDevice)) {
    throw new Error("Failed to verify main device.");
  }
  if (pendingWorkspaceInvitationId && !pendingWorkspaceInvitationKeySubkeyId) {
    throw new UserInputError(
      "pendingWorkspaceInvitationId without workspaceInvitationKeySubkeyId"
    );
  }
  if (
    pendingWorkspaceInvitationId &&
    !pendingWorkspaceInvitationKeyCiphertext
  ) {
    throw new UserInputError(
      "pendingWorkspaceInvitationId without workspaceInvitationKeyCiphertext"
    );
  }
  if (
    pendingWorkspaceInvitationId &&
    !pendingWorkspaceInvitationKeyPublicNonce
  ) {
    throw new UserInputError(
      "pendingWorkspaceInvitationId without workspaceInvitationKeyPublicNonce"
    );
  }
  if (
    pendingWorkspaceInvitationId &&
    !pendingWorkspaceInvitationKeyEncryptionSalt
  ) {
    throw new UserInputError(
      "pendingWorkspaceInvitationId without pendingWorkspaceInvitationKeyEncryptionSalt"
    );
  }
  try {
    return await prisma.$transaction(async (prisma) => {
      // if this user has already completed registration, throw an error
      const existingUserData = await prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (existingUserData) {
        throw new ExpectedGraphqlError(
          "This email has already been registered."
        );
      }
      const confirmationCode = createConfirmationCode();
      const unverifiedUser = await prisma.unverifiedUser.create({
        data: {
          username,
          confirmationCode,
          opaqueEnvelope,
          mainDeviceCiphertext: mainDevice.ciphertext,
          mainDeviceNonce: mainDevice.nonce,
          mainDeviceSigningPublicKey: mainDevice.signingPublicKey,
          mainDeviceEncryptionKeySalt: mainDevice.encryptionKeySalt,
          mainDeviceEncryptionPublicKey: mainDevice.encryptionPublicKey,
          mainDeviceEncryptionPublicKeySignature:
            mainDevice.encryptionPublicKeySignature,
          pendingWorkspaceInvitationId,
          pendingWorkspaceInvitationKeySubkeyId,
          pendingWorkspaceInvitationKeyCiphertext,
          pendingWorkspaceInvitationKeyPublicNonce,
          pendingWorkspaceInvitationKeyEncryptionSalt,
        },
      });
      // TODO: send an email to the user's email address
      console.log(
        `New user confirmation code: ${unverifiedUser.confirmationCode}`
      );
      return unverifiedUser;
    });
  } catch (error) {
    console.error("Error saving user");
    console.log(error);
    throw error;
  }
}
