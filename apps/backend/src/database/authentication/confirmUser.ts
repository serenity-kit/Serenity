import { prisma } from "../prisma";

type Props = {
  username: string;
  confirmationCode: string;
};

// NOTE: we can force a login for this user before they confirm their account
// if we modify the login to check for unconfirmedUser
export async function confirmUser({ username, confirmationCode }: Props) {
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
      const unconfirmedUser = await prisma.unconfirmedUser.findFirst({
        where: {
          username,
          confirmationCode,
        },
      });
      if (!unconfirmedUser) {
        throw new Error("Invalid user or confirmation code");
      }

      const device = await prisma.device.create({
        data: {
          encryptionPublicKey: unconfirmedUser.mainDeviceSigningPublicKey,
          signingPublicKey: unconfirmedUser.mainDeviceSigningPublicKey,
          encryptionPublicKeySignature:
            unconfirmedUser.mainDeviceEncryptionPublicKeySignature,
        },
      });

      const user = await prisma.user.create({
        data: {
          username: unconfirmedUser.username,
          opaqueEnvelope: unconfirmedUser.opaqueEnvelope,
          clientPublicKey: unconfirmedUser.clientPublicKey,
          mainDeviceCiphertext: unconfirmedUser.mainDeviceCiphertext,
          mainDeviceNonce: unconfirmedUser.mainDeviceNonce,
          mainDeviceSigningPublicKey:
            unconfirmedUser.mainDeviceSigningPublicKey,
          mainDeviceEncryptionKeySalt:
            unconfirmedUser.mainDeviceEncryptionKeySalt,
          devices: {
            connect: {
              signingPublicKey: device.signingPublicKey,
            },
          },
        },
      });
      await prisma.unconfirmedUser.delete({
        where: {
          id: unconfirmedUser.id,
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
