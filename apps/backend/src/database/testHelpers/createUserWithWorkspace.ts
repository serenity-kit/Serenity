import { prisma } from "../prisma";

type Params = {
  id: string;
  username: string;
};

export default async function createUserWithWorkspace({
  id,
  username,
}: Params) {
  await prisma.$transaction(async (prisma) => {
    const device = await prisma.device.create({
      data: {
        signingPublicKey: `TODO+${username}`,
        encryptionPublicKey: "TODO",
        encryptionPublicKeySignature: "TODO",
      },
    });
    await prisma.user.create({
      data: {
        username,
        serverPrivateKey: "abc",
        serverPublicKey: "abc",
        oprfPrivateKey: "abc",
        oprfPublicKey: "abc",
        oprfCipherText: "abc",
        oprfNonce: "abc",
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
            username: username,
            isAdmin: true,
          },
        },
      },
    });
  });
}
