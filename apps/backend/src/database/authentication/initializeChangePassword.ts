import {
  createOprfChallengeResponse,
  generateKeyPair,
  generateOprfKeyPair,
} from "@serenity-tools/opaque/server";
import { prisma } from "../prisma";
import sodium from "libsodium-wrappers-sumo";

type InitializeChangePasswordResponseData = {
  serverPrivateKey: Uint8Array;
  serverPublicKey: Uint8Array;
  oprfPrivateKey: Uint8Array;
  oprfPublicKey: Uint8Array;
  oprfChallengeResponse: Uint8Array;
};

export async function initializeChangePassword(
  username: string,
  clientOprfChallenge: Uint8Array
): Promise<InitializeChangePasswordResponseData> {
  const serverKeyPairs = generateKeyPair();
  const oprfKeyPair = generateOprfKeyPair();
  const oprfChallengeResponse = createOprfChallengeResponse(
    clientOprfChallenge,
    oprfKeyPair.privateKey
  );
  // if this user does not exist, we have a problem
  const userData = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  if (!userData) {
    throw Error("User is not registered");
  }
  // reuse the registration object to load the key information
  try {
    await prisma.registration.update({
      where: {
        username: username,
      },
      data: {
        serverPrivateKey: sodium.to_base64(serverKeyPairs.privateKey),
        serverPublicKey: sodium.to_base64(serverKeyPairs.publicKey),
        oprfPrivateKey: sodium.to_base64(oprfKeyPair.privateKey),
        oprfPublicKey: sodium.to_base64(oprfKeyPair.publicKey),
      },
    });
  } catch (error) {
    console.error("Error saving registration");
    console.log(error);
    throw Error("User does not exist");
  }
  return {
    serverPrivateKey: serverKeyPairs.privateKey,
    serverPublicKey: serverKeyPairs.privateKey,
    oprfPrivateKey: oprfKeyPair.privateKey,
    oprfPublicKey: oprfKeyPair.publicKey,
    oprfChallengeResponse,
  };
}
