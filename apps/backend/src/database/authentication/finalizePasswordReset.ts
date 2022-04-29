import { prisma } from "../prisma";

export async function finalizePasswordReset(
  username: string,
  token: string,
  secret: string,
  nonce: string,
  clientPublicKey: string
) {
  // If we can't find the user with a matching OTP, we can't continue.
  const now = new Date();
  console.log({ username, token, now });
  const userData = await prisma.user.findMany({});
  console.log({ userData });
  let user: any = null;
  try {
    user = await prisma.user.findFirst({
      where: {
        username: username,
        passwordResetOneTimePassword: token,
        passwordResetOneTimePasswordExpireDateTime: {
          gt: now,
        },
      },
    });
  } catch (error) {
    console.log({ error });
    throw Error("User is not registered");
  }
  console.log({ user });
  if (!user) {
    throw Error(`Invalid or expired one-time password`);
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
    // TODO: reset other keys?
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
        passwordResetOneTimePassword: null,
        passwordResetOneTimePasswordExpireDateTime: now,
      },
    });
  } catch (error) {
    console.error("Error saving user");
    console.log(error);
    throw Error("Internal server error");
  }
}
