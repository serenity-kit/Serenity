import { createAndEncryptDevice } from "@serenity-tools/common";
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

    const mainDevice = await createAndEncryptDevice(exportKey);

    const device = await prisma.device.create({
      data: {
        signingPublicKey: mainDevice.signingPublicKey,
        encryptionPublicKey: mainDevice.encryptionPublicKey,
        encryptionPublicKeySignature: mainDevice.encryptionPublicKeySignature,
      },
    });

    const user = await prisma.user.create({
      data: {
        username,
        opaqueEnvelope: "TODO",
        mainDeviceCiphertext: mainDevice.ciphertext,
        mainDeviceNonce: mainDevice.nonce,
        mainDeviceSigningPublicKey: mainDevice.signingPublicKey,
        mainDeviceEncryptionKeySalt: mainDevice.encryptionKeySalt,
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
