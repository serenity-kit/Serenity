import { prisma } from "../prisma";

export async function finalizeRegistration(
  username: string,
  opaqueEnvelope: string,
  workspaceId: string
) {
  // if this user has already completed registration, throw an error
  const existingUserData = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (existingUserData) {
    throw Error("This username has already been registered");
  }
  try {
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
          opaqueEnvelope,
          clientPublicKey: `TODO+${username}`,
          masterDeviceCiphertext: "TODO",
          masterDeviceNonce: "TODO",
          masterDevice: {
            connect: { signingPublicKey: device.signingPublicKey },
          },
        },
      });
      const userId = user.id;
      await prisma.device.update({
        where: { signingPublicKey: device.signingPublicKey },
        data: { user: { connect: { id: userId } } },
      });
      await prisma.workspace.create({
        data: {
          id: workspaceId,
          idSignature: "TODO",
          name: "My Workspace",
          usersToWorkspaces: {
            create: {
              userId,
              isAdmin: true,
            },
          },
        },
      });
      return user;
    });
  } catch (error) {
    console.error("Error saving user");
    console.log(error);
    throw Error("Internal server error");
  }
}
