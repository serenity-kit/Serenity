// TODO delete
import {
  createOprfChallengeResponse,
  generateKeyPair,
  generateOprfKeyPair,
} from "@serenity-tools/opaque/server";
import sodium from "libsodium-wrappers-sumo";
import { HandleRegistration } from "../../vendor/opaque-wasm/opaque_wasm";
import { prisma } from "../prisma";

type InitializeRegistrationData = {
  serverPrivateKey: Uint8Array;
  serverPublicKey: Uint8Array;
  oprfPrivateKey: Uint8Array;
  oprfPublicKey: Uint8Array;
  oprfChallengeResponse: Uint8Array;
};

export async function initializeRegistration(
  username: string,
  clientOprfChallenge: Uint8Array
): Promise<InitializeRegistrationData> {
  const serverKeyPairs = generateKeyPair();
  const oprfKeyPair = generateOprfKeyPair();
  const oprfChallengeResponse = createOprfChallengeResponse(
    clientOprfChallenge,
    oprfKeyPair.privateKey
  );

  try {
    await prisma.registration.create({
      data: {
        username,
        serverPrivateKey: sodium.to_base64(serverKeyPairs.privateKey),
        serverPublicKey: sodium.to_base64(serverKeyPairs.publicKey),
        oprfPrivateKey: sodium.to_base64(oprfKeyPair.privateKey),
        oprfPublicKey: sodium.to_base64(oprfKeyPair.publicKey),
      },
    });
  } catch (error) {
    console.error("Error saving registration");
    console.log(error);
    throw Error("Email already registered");
  }

  return {
    serverPrivateKey: serverKeyPairs.privateKey,
    serverPublicKey: serverKeyPairs.publicKey,
    oprfPrivateKey: oprfKeyPair.privateKey,
    oprfPublicKey: oprfKeyPair.publicKey,
    oprfChallengeResponse,
  };
}
