import { prisma } from "../prisma";
import {
  crypto_sign_detached,
  crypto_secretbox_easy,
  // crypto_secretbox_NONCEBYTES, // FIXME: this is not exported
  randombytes_buf,
  to_base64,
} from "@serenity-tools/libsodium";
import { crypto_secretbox_NONCEBYTES } from "libsodium-wrappers-sumo";
import { createDevice } from "./createDevice";
import { Device } from "../../types/device";
import { RecoveryDevice } from "../../types/recoveryDevice";

type Params = {
  userId: string;
};

type CreateRecoveryDeviceResponse = {
  mainDevice: Device;
  recoveryDevice: RecoveryDevice;
};

export async function createMainAndRecoveryDevice({
  userId,
}: Params): Promise<CreateRecoveryDeviceResponse> {
  return await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      throw new Error("Unauthorized");
    }
    // get the old recovery device link
    const oldRecoveryDevice = await prisma.recoveryDevice.findFirst({
      where: { userId },
    });
    // get the old recovery device
    // remove old recovery device link
    await prisma.recoveryDevice.deleteMany({
      where: {
        userId,
      },
    });
    const newMainDevice = await createDevice({ userId });
    const newRecoveryDevice = await createDevice({ userId });
    // TODO: update:
    // user.mainDeviceCiphertext
    // user.mainDeviceNonce
    // user.mainDeviceSigningPublicKey

    // Note: The user should aleady be verified to exist by this point
    // const signingKeyPair = await crypto_sign_keypair();
    // const encryptionKeyPair = crypto_box_keypair();

    // convert the signing and encryption private keys into a ciphertext
    const nonce = await randombytes_buf(crypto_secretbox_NONCEBYTES);

    const rawKeyPairData = JSON.stringify({
      signingPublicKey: newRecoveryDevice.signingPublicKey,
      encryptionPublicKey: newRecoveryDevice.encryptionPublicKey,
    });
    const base64EncodedPairData = to_base64(rawKeyPairData);

    const cipherText = crypto_secretbox_easy(
      base64EncodedPairData,
      nonce,
      newRecoveryDevice.encryptionPrivateKey!
    );

    // sign the main device public key using the recovery private key
    const signatureForMainDeviceSigningPublicKey = await crypto_sign_detached(
      newMainDevice.signingPublicKey,
      newRecoveryDevice.signingPrivateKey!
    );

    // sign the recovery public key using the main private key
    const signatureForRecoveryDeviceSigningPublicKey =
      await crypto_sign_detached(
        newRecoveryDevice.signingPublicKey,
        newMainDevice.signingPrivateKey!
      );

    await prisma.recoveryDevice.create({
      data: {
        userId,
        deviceSigningPublicKey: newRecoveryDevice.signingPublicKey,
        deviceSigningKeyType: newRecoveryDevice.signingKeyType,
        signatureForRecoveryDeviceSigningPublicKey,
        signatureForMainDeviceSigningPublicKey,
        nonce,
        ciphertext: cipherText,
      },
    });

    // update the user with the new main device information
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        mainDeviceCiphertext: cipherText,
        mainDeviceNonce: nonce,
        mainDeviceSigningPublicKey: newMainDevice.signingPublicKey,
      },
    });

    // delete old main device and recovery device
    const deletableDeviceKeys: string[] = [];
    if (oldRecoveryDevice) {
      deletableDeviceKeys.push(oldRecoveryDevice.deviceSigningPublicKey);
    }
    if (user.mainDeviceSigningPublicKey) {
      deletableDeviceKeys.push(user.mainDeviceSigningPublicKey);
    }
    if (deletableDeviceKeys.length > 0) {
      await prisma.device.deleteMany({
        where: {
          signingPublicKey: {
            in: deletableDeviceKeys,
          },
        },
      });
    }

    return {
      mainDevice: {
        ...newMainDevice,
        encryptionPrivateKey: newMainDevice.encryptionPrivateKey,
        signingPrivateKey: newMainDevice.signingPrivateKey,
      },
      recoveryDevice: {
        ...newRecoveryDevice,
        deviceSigningPublicKey: newRecoveryDevice.signingPublicKey,
        deviceSigningPrivateKey: newRecoveryDevice.signingPrivateKey,
        deviceSigningKeyType: newRecoveryDevice.signingKeyType,

        deviceEncryptionPublicKey: newRecoveryDevice.encryptionPublicKey,
        deviceEncryptionPrivateKey: newRecoveryDevice.encryptionPrivateKey,
        deviceEncryptionKeyType: newRecoveryDevice.encryptionKeyType,

        userId: user.id,
        ciphertext: cipherText,
        nonce,

        signatureForRecoveryDeviceSigningPublicKey,
        signatureForMainDeviceSigningPublicKey,
      },
    };
  });
}
