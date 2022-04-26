import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { finalizeRegistration } from "../../database/authentication/finalizeRegistration";

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

export const finalizeRegistrationMutation = mutationField(
  "finalizeRegistration",
  {
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
        throw Error(
          'Missing parameter: "nonce" must be a base64-encoded string'
        );
      }
      if (!clientPublicKey) {
        throw Error(
          'Missing parameter: "clientPublicKey" must be a base64-encoded string'
        );
      }
      finalizeRegistration(username, secret, nonce, clientPublicKey);
      const result = {
        status: "success",
      };
      return result;
    },
  }
);
