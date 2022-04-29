import { arg, inputObjectType, mutationField, objectType } from "nexus";
import sodium from "libsodium-wrappers-sumo";
import { initializeLogin } from "../../database/authentication/initializeLogin";

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

export const initializeLoginMutation = mutationField("initializeLogin", {
  type: ClientOprfLoginChallengeResult,
  args: {
    input: arg({
      type: ClientOprfLoginChallengeInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args || !args.input) {
      throw Error("Missing input");
    }
    const username = args.input.username;
    const b64ClientOprfChallenge = args.input.challenge;
    let clientOprfChallenge = new Uint8Array(32);
    try {
      clientOprfChallenge = sodium.from_base64(b64ClientOprfChallenge);
    } catch (error) {
      throw Error("challenge must be a base64-encoded byte array");
    }
    const { userData, oprfChallengeResponse } = await initializeLogin(
      username,
      clientOprfChallenge
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
