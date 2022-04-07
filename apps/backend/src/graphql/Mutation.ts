import {
  arg,
  inputObjectType,
  mutationField,
  objectType,
  queryType,
} from "nexus";
import {
  createOprfChallengeResponse,
  generateKeyPair,
  getPublicKeyFromPrivateKey,
} from "@serenity-tools/opaque";
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

const ClientOprfLoginChallengeInput = inputObjectType({
  name: "ClientOprfLoginChallengeInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("challenge");
  },
});

const ClientOprfLoginChallengeResult = objectType({
  name: "ClientOprfLoginChallengeResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

const ClientOprfLoginFinalizeInput = inputObjectType({
  name: "ClientOprfLoginFinalizeInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("sharedTx");
    t.nonNull.string("sharedRx");
  },
});

const ClientOprfLoginFinalizeeResult = objectType({
  name: "ClientOprfLoginFinalizeeResult",
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

export const initializeLogin = mutationField("initializeLogin", {
  type: ClientOprfLoginChallengeResult,
  args: {
    input: arg({
      type: ClientOprfLoginChallengeInput,
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
    // if this user does not exist, we have a problem
    const userData = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!userData) {
      throw Error("User is not registered");
    }
    const oprfPrivateKey = sodium.from_base64(userData.oprfPrivateKey);
    const oprfChallengeResponse = createOprfChallengeResponse(
      clientOprfChallenge,
      oprfPrivateKey
    );
    const oprfPublicKey = getPublicKeyFromPrivateKey(oprfPrivateKey);
    const result = {
      secret: sodium.to_base64(userData.oprfCipherText),
      nonce: sodium.to_base64(userData.oprfNonce),
      oprfPublicKey: sodium.to_base64(oprfPublicKey),
      oprfChallengeResponse: sodium.to_base64(oprfChallengeResponse),
    };
    return result;
  },
});

export const finalizeLogin = mutationField("finalizeLogin", {
  type: ClientOprfLoginFinalizeeResult,
  args: {
    input: arg({
      type: ClientOprfLoginFinalizeInput,
    }),
  },
  async resolve(root, args, context) {
    const username = args?.input?.username;
    if (!username) {
      throw Error('Missing parameter: "username" must be string');
    }
    const b64UserSharedRx = args?.input?.sharedRx || "";
    const b64UserSharedTx = args?.input?.sharedTx || "";
    let userSharedRx = new Uint8Array(32);
    try {
      userSharedRx = sodium.from_base64(b64UserSharedRx);
    } catch (error) {
      throw Error("sharedRx must be a base64-encoded byte array");
    }
    let userSharedTx = new Uint8Array(32);
    try {
      userSharedTx = sodium.from_base64(b64UserSharedTx);
    } catch (error) {
      throw Error("sharedTx must be a base64-encoded byte array");
    }
    // if this user does not exist, we have a problem
    const userData = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!userData) {
      throw Error("User is not registered");
    }

    const serverPrivateKey = sodium.from_base64(userData.serverPrivateKey);
    const serverPublicKey = getPublicKeyFromPrivateKey(serverPrivateKey);
    const clientPublicKey = sodium.from_base64(userData.clientPublicKey);

    const serverSession = sodium.crypto_kx_server_session_keys(
      serverPublicKey,
      serverPrivateKey,
      clientPublicKey
    );
    const b64ServerSharedRx = sodium.to_base64(serverSession.sharedRx);
    const b64ServerSharedTx = sodium.to_base64(serverSession.sharedTx);
    // verify the login works
    let status = "fail";
    if (
      b64UserSharedRx == b64ServerSharedRx &&
      b64UserSharedTx == b64ServerSharedTx
    ) {
      status = "success";
    }
    const result = {
      status,
    };
    return result;
  },
});
