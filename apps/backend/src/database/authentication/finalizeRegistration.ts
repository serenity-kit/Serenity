import { prisma } from "../prisma";
import * as sodium from "@serenity-tools/libsodium";
import { Device } from "../../types/device";

type DeviceInput = Device & {
  ciphertext: string;
  nonce: string;
  encryptionKeySalt: string;
};

type Props = {
  username: string;
  opaqueEnvelope: string;
  mainDevice: DeviceInput;
};

const createConfirmationCode = async (): Promise<string> => {
  const length = 8;
  const confirmationCode: number[] = new Array(length);
  for (let i = 0; i < length; i++) {
    confirmationCode[i] = await sodium.randombytes_uniform(10);
  }
  return confirmationCode.join("");
};

const verifyDevice = async (device: DeviceInput) => {
  return await sodium.crypto_sign_verify_detached(
    device.encryptionPublicKeySignature,
    device.encryptionPublicKey,
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
          username,
        },
      });
      if (existingUserData) {
        throw Error("This username has already been registered");
      }

      const confirmationCode = await createConfirmationCode();

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
    throw Error("Internal server error");
  }
}
