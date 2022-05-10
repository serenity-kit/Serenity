import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { initializeChangePassword } from "../../../database/authentication/initializeChangePassword";
import sodium from "libsodium-wrappers-sumo";

export const ClientRequestResetPasswordRequest = inputObjectType({
  name: "ClientRequestResetPasswordRequest",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("challenge");
  },
});

export const ClientRequestResetPasswordResult = objectType({
  name: "ClientRequestResetPasswordResult",
  definition(t) {
    t.nonNull.string("serverPublicKey");
    t.nonNull.string("oprfPublicKey");
    t.nonNull.string("oprfChallengeResponse");
  },
});

export const initializeChangePasswordMutation = mutationField(
  "initializeChangePassword",
  {
    type: ClientRequestResetPasswordResult,
    args: {
      input: arg({
        type: ClientRequestResetPasswordRequest,
      }),
    },
    async resolve(root, args, context) {
      const username = args?.input?.username;
      if (!username) {
        throw Error('Missing parameter: "username" must be string');
      }
      const b64ClientOprfChallenge = args?.input?.challenge || "";
      let clientOprfChallenge = new Uint8Array(32);
      try {
        clientOprfChallenge = sodium.from_base64(b64ClientOprfChallenge);
      } catch (error) {
        throw Error("challenge must be a base64-encoded byte array");
      }
      const { serverPublicKey, oprfPublicKey, oprfChallengeResponse } =
        await initializeChangePassword(username, clientOprfChallenge);
      const result = {
        serverPublicKey: sodium.to_base64(serverPublicKey),
        oprfPublicKey: sodium.to_base64(oprfPublicKey),
        oprfChallengeResponse: sodium.to_base64(oprfChallengeResponse),
      };
      return result;
    },
  }
);
