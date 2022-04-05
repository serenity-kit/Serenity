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

const ClientOprfRegistrationFinalizeInput = inputObjectType({
  name: "ClientOprfRegistrationFinalizeInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("secret");
    t.nonNull.string("nonce");
    t.nonNull.string("clientPublicKey");
  },
});

const ClientOprfRegistrationFinalizeResult = objectType({
  name: "ClientOprfRegistrationFinalizeResult",
  definition(t) {
    t.nonNull.string("status");
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

export const finalizeRegistration = mutationField("finalizeRegistration", {
  type: ClientOprfRegistrationFinalizeResult,
  args: {
    input: arg({
      type: ClientOprfRegistrationFinalizeInput,
    }),
  },
  async resolve(root, args, context) {
    const username = args?.input?.username;
    const secret = args?.input?.secret;
    const nonce = args?.input?.nonce;
    const clientPublicKey = args?.input?.clientPublicKey;
    if (!username) {
      throw Error('Missing parameter: "secret" must be a string');
    }
    if (!secret) {
      throw Error(
        'Missing parameter: "username" must be a base64-encoded string'
      );
    }
    if (!nonce) {
      throw Error('Missing parameter: "nonce" must be a base64-encoded string');
    }
    if (!clientPublicKey) {
      throw Error(
        'Missing parameter: "clientPublicKey" must be a base64-encoded string'
      );
    }

    // if this user has already completed registration, throw an error
    const existingUserData = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    console.log(existingUserData);
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
          serverPrivateKey: sodium.to_base64(registrationData.serverPrivateKey),
          oprfPrivateKey: sodium.to_base64(registrationData.oprfPrivateKey),
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
    const result = {
      status: "success",
    };
    return result;
  },
});
