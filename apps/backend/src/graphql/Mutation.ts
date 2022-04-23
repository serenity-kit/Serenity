import { arg, inputObjectType, mutationField, objectType } from "nexus";
import {
  createOprfChallengeResponse,
  generateKeyPair,
  generateOprfKeyPair,
} from "@serenity-tools/opaque/server";
import sodium from "libsodium-wrappers-sumo";
import { prisma } from "../database/prisma";
// two week expiration
const USER_LOGIN_ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 24 * 15;

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

export const ClientOprfRegistrationFinalizeInput = inputObjectType({
  name: "ClientOprfRegistrationFinalizeInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("secret");
    t.nonNull.string("nonce");
    t.nonNull.string("clientPublicKey");
  },
});

export const ClientOprfRegistrationFinalizeResult = objectType({
  name: "ClientOprfRegistrationFinalizeResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const ClientOprfLoginChallengeInput = inputObjectType({
  name: "ClientOprfLoginChallengeInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("challenge");
  },
});

export const ClientOprfLoginChallengeResult = objectType({
  name: "ClientOprfLoginChallengeResult",
  definition(t) {
    t.nonNull.string("secret");
    t.nonNull.string("nonce");
    t.nonNull.string("oprfPublicKey");
    t.nonNull.string("oprfChallengeResponse");
  },
});

export const ClientOprfLoginFinalizeInput = inputObjectType({
  name: "ClientOprfLoginFinalizeInput",
  definition(t) {
    t.nonNull.string("username");
  },
});

export const ClientOprfLoginFinalizeeResult = objectType({
  name: "ClientOprfLoginFinalizeeResult",
  definition(t) {
    t.nonNull.string("oauthData");
    t.nonNull.string("nonce");
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
    // TODO throw error if the challenge does not exist
    const b64ClientOprfChallenge = args?.input?.challenge || "";

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
    // just in case the oprf key pair is not compatible with this method
    // getPublicKeyFromPrivateKey(oprfPrivateKey);
    // we can just store it in the database.
    const oprfPublicKey = sodium.from_base64(userData.oprfPublicKey);
    const result = {
      secret: userData.oprfCipherText,
      nonce: userData.oprfNonce,
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

    const accessToken = sodium.to_base64(
      sodium.crypto_core_ed25519_scalar_random()
    );

    const expiresAt = new Date(
      Date.now() + USER_LOGIN_ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS
    );
    try {
      await prisma.userLoginAccessToken.create({
        data: {
          accessToken,
          expiresAt,
          user: {
            connect: {
              username,
            },
          },
        },
      });
    } catch (error) {
      throw Error("Internal server error");
    }
    const expiresIn = expiresAt.getTime() - Date.now();
    const oauthResponse = {
      accessToken,
      tokenType: "Bearer",
      expiresIn,
    };
    // generate nonce
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
    // encrypt the oauth response
    const oauthResponseBytes = new Uint8Array(
      Buffer.from(JSON.stringify(oauthResponse))
    );
    const encryptedOauthResponseBytes = sodium.crypto_secretbox_easy(
      oauthResponseBytes,
      nonce,
      serverSharedKeys.sharedTx
    );
    return {
      oauthData: sodium.to_base64(encryptedOauthResponseBytes),
      nonce: sodium.to_base64(nonce),
    };
  },
});
