import { prisma } from "../prisma";
import * as sodium from "@serenity-tools/libsodium";
import canonicalize from "canonicalize";

type DeviceInput = {
  ciphertext: string;
  encryptionPublicKey: string;
  keyPairSignature: string;
  nonce: string;
  signingPublicKey: string;
  encryptionKeySalt: string;
};

type Props = {
  username: string;
  opaqueEnvelope: string;
  mainDevice: DeviceInput;
};

const verifyDevice = async (device: DeviceInput) => {
  const keyPairSignatureString = canonicalize({
    signingPublicKey: device.signingPublicKey,
    encryptionPublicKey: device.encryptionPublicKey,
  });
  if (!keyPairSignatureString) {
    throw new Error("Failed to canonicalize the keys.");
  }
  return await sodium.crypto_sign_verify_detached(
    device.keyPairSignature,
    keyPairSignatureString,
    device.signingPublicKey
  );
};

export async function finalizeRegistration({
  username,
  opaqueEnvelope,
  mainDevice,
}: Props) {
  if (!verifyDevice(mainDevice)) {
    throw new Error("Failed to verify main device.");
  }

  try {
    return await prisma.$transaction(async (prisma) => {
      // if this user has already completed registration, throw an error
      const existingUserData = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });
      if (existingUserData) {
        throw Error("This username has already been registered");
      }

      const unconfirmedUser = await prisma.unconfirmedUser.create({
        data: {
          username,
          opaqueEnvelope,
          clientPublicKey: `TODO+${username}`,
          mainDeviceCiphertext: mainDevice.ciphertext,
          mainDeviceNonce: mainDevice.nonce,
          mainDeviceSigningPublicKey: mainDevice.signingPublicKey,
          mainDeviceEncryptionKeySalt: mainDevice.encryptionKeySalt,
        },
      });
      // TODO: send an email to the user's email address
      console.log(
        `New user confirmation code: ${unconfirmedUser.confirmationCode}`
      );
      return unconfirmedUser;
    });
  } catch (error) {
    console.error("Error saving user");
    console.log(error);
    throw Error("Internal server error");
  }
}
