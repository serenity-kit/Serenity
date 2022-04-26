import { prisma } from "../prisma";

export async function finalizePasswordReset(
  username: string,
  token: string,
  secret: string,
  nonce: string,
  clientPublicKey: string
) {
  // If we can't find the user with a matching OTP, we can't continue.
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (!user || user.passwordResetOneTimePassword !== token) {
    throw Error("Invalid one-time password");
  }
  // try to get the overloaded registration
  const registrationData = await prisma.registration.findUnique({
    where: {
      username: username,
    },
  });
  if (!registrationData) {
    throw Error("This username has not yet been initialized");
  }
  try {
    await prisma.user.update({
      where: {
        username: username,
      },
      data: {
        serverPrivateKey: registrationData.serverPrivateKey,
        serverPublicKey: registrationData.serverPublicKey,
        oprfPrivateKey: registrationData.oprfPrivateKey,
        oprfPublicKey: registrationData.oprfPublicKey,
        oprfCipherText: secret,
        oprfNonce: nonce,
        clientPublicKey,
      },
    });
  } catch (error) {
    console.error("Error saving user");
    console.log(error);
    throw Error("Internal server error");
  }
}
