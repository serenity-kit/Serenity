import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { finalizePasswordReset } from "../../database/authentication/finalizePasswordReset";

export const ClientOprfRegistrationFinalizeInput = inputObjectType({
  name: "ClientOprfRegistrationFinalizeInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("token");
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

export const finalizePasswordResetMutation = mutationField(
  "finalizePasswordReset",
  {
    type: ClientOprfRegistrationFinalizeResult,
    args: {
      input: arg({
        type: ClientOprfRegistrationFinalizeInput,
      }),
    },
    async resolve(root, args, context) {
      const username = args?.input?.username;
      const token = args?.input?.token;
      const secret = args?.input?.secret;
      const nonce = args?.input?.nonce;
      const clientPublicKey = args?.input?.clientPublicKey;
      if (!username) {
        throw Error('Missing parameter: "username" must be a string');
      }
      if (!secret) {
        throw Error(
          'Missing parameter: "secret" must be a base64-encoded string'
        );
      }
      if (!token) {
        throw Error(
          'Missing parameter: "token" must be a base64-encoded string'
        );
      }
      if (!nonce) {
        throw Error(
          'Missing parameter: "nonce" must be a base64-encoded string'
        );
      }
      if (!clientPublicKey) {
        throw Error(
          'Missing parameter: "clientPublicKey" must be a base64-encoded string'
        );
      }
      finalizePasswordReset(username, token, secret, nonce, clientPublicKey);
      const result = {
        status: "success",
      };
      return result;
    },
  }
);
