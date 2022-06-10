import { prisma } from "../prisma";

type Props = {
  username: string;
  opaqueEnvelope: string;
  // workspaceId: string
};

export async function finalizeRegistration({
  username,
  opaqueEnvelope,
}: Props) {
  // if this user has already completed registration, throw an error
  const existingUserData = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (existingUserData) {
    throw Error("This username has already been registered");
  }
  const existingUnconfirmedUserData = await prisma.unconfirmedUser.findUnique({
    where: {
      username: username,
    },
  });
  if (existingUnconfirmedUserData) {
    throw Error("This username has already been registered");
  }

  try {
    return await prisma.$transaction(async (prisma) => {
      const unconfirmedUser = await prisma.unconfirmedUser.create({
        data: {
          username: username,
          opaqueEnvelope: opaqueEnvelope,
          clientPublicKey: `TODO+${username}`,
        },
      });
      // TODO: send an email to the user's email address
      console.log(
        `New user confirmation code: ${unconfirmedUser.confirmationCode}`
      );
      /*
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
          mainDeviceCiphertext: "TODO",
          mainDeviceNonce: "TODO",
          mainDevice: {
            connect: { signingPublicKey: device.signingPublicKey },
          },
        },
      });
      const userId = user.id;
      await prisma.device.update({
        where: { signingPublicKey: device.signingPublicKey },
        data: { user: { connect: { id: userId } } },
      });
      /* */
      return unconfirmedUser;
    });
  } catch (error) {
    console.error("Error saving user");
    console.log(error);
    throw Error("Internal server error");
  }
}
