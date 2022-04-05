import {
  arg,
  inputObjectType,
  mutationField,
  objectType,
  queryType,
} from "nexus";
import { createOprfChallengeResponse, generateKeyPair } from "../utils/opaque";
import sodium from "libsodium-wrappers-sumo";
import { prisma } from "../database/prisma";

// FIXME: move this to a database
const registeredClients = {};

const ClientOprfRegistrationChallengeInput = inputObjectType({
  name: "ClientOprfRegistrationChallengeRequest",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("challenge");
  },
});

const ClientOprfRegistrationChallengeResult = objectType({
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
    // input: { username: string, challenge: b64string }
    // output: { serverPubKey: b64string, oprfPubKey: b64string, challengeResponse: b64string }
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
    const oprfKeyPair = generateKeyPair();
    const oprfChallengeResponse = createOprfChallengeResponse(
      clientOprfChallenge,
      oprfKeyPair.privateKey
    );
    try {
      await prisma.registration.create({
        data: {
          username,
          serverPrivateKey: sodium.to_base64(serverKeyPairs.privateKey),
          oprfPrivateKey: sodium.to_base64(oprfKeyPair.privateKey),
        },
      });
    } catch (error) {
      console.error("Error saving registration");
      console.log(error);
      throw Error("Internal server error");
    }
    const result = {
      serverPublicKey: sodium.to_base64(serverPublicKey),
      oprfPublicKey: sodium.to_base64(oprfKeyPair.publicKey),
      oprfChallengeResponse: sodium.to_base64(oprfChallengeResponse),
    };
    return result;
  },
});
