import {
  createAndEncryptDevice,
  createEncryptionKeyFromOpaqueExportKey,
} from "@serenity-tools/utils";
import sodium from "libsodium-wrappers";
import { prisma } from "../prisma";

type Params = {
  id: string;
  username: string;
};

export default async function createUserWithWorkspace({
  id,
  username,
}: Params) {
  return await prisma.$transaction(async (prisma) => {
    const exportKey = "12345689";

    const { encryptionKey, encryptionKeySalt } =
      await createEncryptionKeyFromOpaqueExportKey(sodium.to_base64(exportKey));
    const mainDevice = await createAndEncryptDevice(encryptionKey);

    const device = await prisma.device.create({
      data: {
        signingPublicKey: mainDevice.signingKeyPair.publicKey,
        encryptionPublicKey: mainDevice.encryptionKeyPair.publicKey,
        encryptionPublicKeySignature: mainDevice.encryptionPublicKeySignature,
      },
    });

    const user = await prisma.user.create({
      data: {
        username,
        opaqueEnvelope: "TODO",
        mainDeviceCiphertext: mainDevice.cipherText,
        mainDeviceNonce: mainDevice.nonce,
        mainDeviceSigningPublicKey: mainDevice.signingKeyPair.publicKey,
        mainDeviceEncryptionKeySalt: encryptionKeySalt,
        devices: {
          connect: {
            signingPublicKey: device.signingPublicKey,
          },
        },
      },
    });

    await prisma.workspace.create({
      data: {
        id,
        name: "My Workspace",
        idSignature: "TODO",
        usersToWorkspaces: {
          create: {
            userId: user.id,
            isAdmin: true,
          },
        },
      },
    });
    return { user, device };
  });
}
