import { prisma } from "../prisma";

export async function finalizeRegistration(
  username: string,
  secret: string,
  nonce: string,
  clientPublicKey: string
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
    await prisma.user.create({
      data: {
        username,
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
