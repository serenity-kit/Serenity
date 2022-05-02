import sodium from "libsodium-wrappers-sumo";
import { prisma } from "../prisma";
import { decryptSessionJsonMessage } from "@serenity-tools/opaque/common";
// two week expiration
const USER_LOGIN_ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 24 * 15;

export async function finalizeChangePassword(
  username: string,
  nonce: string,
  encryptedSecret: string
) {
  // if this user does not exist, we have a problem
  const userData = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (!userData) {
    throw Error("User is not registered");
  }
  // let's see if we can extract the secret data that was sent
  // start by building the shared keys
  const serverPrivateKey = sodium.from_base64(userData.serverPrivateKey);
  // we used to use getPublicKeyFromPrivateKey(serverPrivateKey);
  // to derive the server public key, but it turns out that
  // the server pbulic key must be curve22519 but the method
  // relies on ed22519
  const serverPublicKey = sodium.from_base64(userData.serverPublicKey);
  const clientPublicKey = sodium.from_base64(userData.clientPublicKey);
  const serverSharedKeys = sodium.crypto_kx_server_session_keys(
    serverPublicKey,
    serverPrivateKey,
    clientPublicKey
  );
  // decode the encrypted secret
  // if the server cannot decrypt the secret, it can't
  // continue to change the password
  const decryptedJsonData = decryptSessionJsonMessage(
    encryptedSecret,
    nonce,
    sodium.to_base64(serverSharedKeys.sharedRx)
  );
  const secret = decryptedJsonData.secret;

  // try to get the overloaded registration,
  // containing the new server and oprf keys
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
        clientPublicKey: sodium.to_base64(clientPublicKey),
      },
    });
  } catch (error) {
    console.error("Error saving user");
    console.log(error);
    throw Error("Internal server error");
  }
}
