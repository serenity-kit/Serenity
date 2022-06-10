import { crypto_sign_keypair } from "@serenity-tools/libsodium";
import { createMainAndRecoveryDevice } from "../device/createMainAndRecoveryDevice";
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
      // find this unconfirmed user
      // create a new user
      // create main and recovery devices for this user
      // delete the unconfirmed user
      // return the new user
      const unconfirmedUser = await prisma.unconfirmedUser.findFirst({
        where: {
          username,
          confirmationCode,
        },
      });
      if (!unconfirmedUser) {
        throw new Error("Invalid user or confirmation code");
      }

      // TODO: create keypair
      // const signingKeyPair = await crypto_sign_keypair();

      const user = await prisma.user.create({
        data: {
          username: unconfirmedUser.username,
          opaqueEnvelope: unconfirmedUser.opaqueEnvelope,
          clientPublicKey: `TODO+${username}`, // TODO: signingKeyPair.publicKey,
          mainDeviceCiphertext: "invalid",
          mainDeviceNonce: "invalid",
        },
      });
      const devices = await createMainAndRecoveryDevice({
        userId: user.id,
      });
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          mainDeviceCiphertext: devices.mainDevice.ciphertext,
          mainDeviceNonce: devices.mainDevice.nonce,
          mainDevice: {
            connect: {
              signingPublicKey: devices.mainDevice.signingPublicKey,
            },
          },
        },
      });
      await prisma.device.update({
        where: {
          signingPublicKey: devices.recoveryDevice.deviceSigningPublicKey,
        },
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      await prisma.device.update({
        where: {
          signingPublicKey: devices.mainDevice.signingPublicKey,
        },
        data: {
          user: {
            connect: {
              id: user.id,
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
