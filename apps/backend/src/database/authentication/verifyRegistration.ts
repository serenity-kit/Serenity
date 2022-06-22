import { prisma } from "../prisma";

type Props = {
  username: string;
  confirmationCode: string;
};

// NOTE: we can force a login for this user before they confirm their account
// if we modify the login to check for unverifiedUser
export async function verifyRegistration({
  username,
  confirmationCode,
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
  try {
    return await prisma.$transaction(async (prisma) => {
      const unverifiedUser = await prisma.unverifiedUser.findFirst({
        where: {
          username,
          confirmationCode,
        },
      });
      if (!unverifiedUser) {
        throw new Error("Invalid user or confirmation code");
      }

      const device = await prisma.device.create({
        data: {
          encryptionPublicKey: unverifiedUser.mainDeviceSigningPublicKey,
          signingPublicKey: unverifiedUser.mainDeviceSigningPublicKey,
          encryptionPublicKeySignature:
            unverifiedUser.mainDeviceEncryptionPublicKeySignature,
        },
      });

      const user = await prisma.user.create({
        data: {
          username: unverifiedUser.username,
          opaqueEnvelope: unverifiedUser.opaqueEnvelope,
          mainDeviceCiphertext: unverifiedUser.mainDeviceCiphertext,
          mainDeviceNonce: unverifiedUser.mainDeviceNonce,
          mainDeviceSigningPublicKey: unverifiedUser.mainDeviceSigningPublicKey,
          mainDeviceEncryptionKeySalt:
            unverifiedUser.mainDeviceEncryptionKeySalt,
          devices: {
            connect: {
              signingPublicKey: device.signingPublicKey,
            },
          },
        },
      });
      await prisma.unverifiedUser.delete({
        where: {
          id: unverifiedUser.id,
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
