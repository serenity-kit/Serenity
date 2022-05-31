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
    const device = await prisma.device.create({
      data: {
        signingPublicKey: `TODO+${username}`,
        encryptionPublicKey: "TODO",
        encryptionPublicKeySignature: "TODO",
      },
    });
    const user = await prisma.user.create({
      data: {
        username,
        opaqueEnvelope: "TODO",
        clientPublicKey: "abc",
        masterDeviceCiphertext: "TODO",
        masterDeviceNonce: "TODO",
        masterDevice: {
          connect: { signingPublicKey: device.signingPublicKey },
        },
      },
    });
    await prisma.device.update({
      where: { signingPublicKey: device.signingPublicKey },
      data: { user: { connect: { username: username } } },
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
    return user;
  });
}
