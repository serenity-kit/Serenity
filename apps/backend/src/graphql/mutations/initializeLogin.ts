import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createOprfChallengeResponse } from "@serenity-tools/opaque/server";
import sodium from "libsodium-wrappers-sumo";
import { prisma } from "../../database/prisma";

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
