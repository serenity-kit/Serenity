import { arg, inputObjectType, mutationField, objectType } from "nexus";
import sodium from "libsodium-wrappers-sumo";
import { prisma } from "../../database/prisma";
// two week expiration
const USER_LOGIN_ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 24 * 15;

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
