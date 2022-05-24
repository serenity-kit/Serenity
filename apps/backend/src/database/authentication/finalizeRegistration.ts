import { prisma } from "../prisma";

export async function finalizeRegistration(
  username: string,
  secret: string,
  nonce: string,
  clientPublicKey: string,
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
  // try to get the existing registration
  const registrationData = await prisma.registration.findUnique({
    where: {
      username: username,
    },
  });
  if (!registrationData) {
    throw Error("This username has not yet been initialized");
  }
  try {
    return await prisma.$transaction(async (prisma) => {
      const device = await prisma.device.create({
        data: {
          signingPublicKey: `TODO+${registrationData.username}`,
          encryptionPublicKey: "TODO",
          encryptionPublicKeySignature: "TODO",
        },
      });
      const user = await prisma.user.create({
        data: {
          username,
          serverPrivateKey: registrationData.serverPrivateKey,
          serverPublicKey: registrationData.serverPublicKey,
          oprfPrivateKey: registrationData.oprfPrivateKey,
          oprfPublicKey: registrationData.oprfPublicKey,
          oprfCipherText: secret,
          oprfNonce: nonce,
          clientPublicKey,
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
