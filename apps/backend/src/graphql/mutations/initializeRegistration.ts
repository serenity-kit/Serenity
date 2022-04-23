import { arg, inputObjectType, mutationField, objectType } from "nexus";
import {
  createOprfChallengeResponse,
  generateKeyPair,
  generateOprfKeyPair,
} from "@serenity-tools/opaque/server";
import sodium from "libsodium-wrappers-sumo";
import { prisma } from "../../database/prisma";

export const ClientOprfRegistrationChallengeInput = inputObjectType({
  name: "ClientOprfRegistrationChallengeRequest",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("challenge");
  },
});

export const ClientOprfRegistrationChallengeResult = objectType({
  name: "ClientOprfRegistrationChallengeResult",
  definition(t) {
    t.nonNull.string("serverPublicKey");
    t.nonNull.string("oprfPublicKey");
    t.nonNull.string("oprfChallengeResponse");
  },
});

export const initializeRegistration = mutationField("initializeRegistration", {
  type: ClientOprfRegistrationChallengeResult,
  args: {
    input: arg({
      type: ClientOprfRegistrationChallengeInput,
    }),
  },
  async resolve(root, args, context) {
    const username = args?.input?.username;
    if (!username) {
      throw Error('Missing parameter: "username" must be string');
    }
    const b64ClientOprfChallenge = args?.input?.challenge || "";
    const serverKeyPairs = generateKeyPair();
    const serverPublicKey = serverKeyPairs.publicKey;
    let clientOprfChallenge = new Uint8Array(32);
    try {
      clientOprfChallenge = sodium.from_base64(b64ClientOprfChallenge);
    } catch (error) {
      throw Error("challenge must be a base64-encoded byte array");
    }
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
    const result = {
      serverPublicKey: sodium.to_base64(serverPublicKey),
      oprfPublicKey: sodium.to_base64(oprfKeyPair.publicKey),
      oprfChallengeResponse: sodium.to_base64(oprfChallengeResponse),
    };
    return result;
  },
});
