import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { finalizeChangePassword } from "../../database/authentication/finalizeChangePassword";

export const ClientOprfRegistrationFinalizeInput = inputObjectType({
  name: "ClientOprfRegistrationFinalizeInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("nonce");
    t.nonNull.string("encryptedSecret");
  },
});

export const ClientOprfRegistrationFinalizeResult = objectType({
  name: "ClientOprfRegistrationFinalizeResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const finalizeChangePasswordMutation = mutationField(
  "finalizeChangePassword",
  {
    type: ClientOprfRegistrationFinalizeResult,
    args: {
      input: arg({
        type: ClientOprfRegistrationFinalizeInput,
      }),
    },
    async resolve(root, args, context) {
      const username = args?.input?.username;
      const nonce = args?.input?.nonce;
      const encryptedSecret = args?.input?.encryptedSecretNonce;
      if (!username) {
        throw Error('Missing parameter: "username" must be a string');
      }
      if (!encryptedSecret) {
        throw Error(
          'Missing parameter: "encryptedSecret" must be a base64-encoded string'
        );
      }
      if (!nonce) {
        throw Error(
          'Missing parameter: "nonce" must be a base64-encoded string'
        );
      }
      await finalizeChangePassword(username, nonce, encryptedSecret);
      const result = {
        status: "success",
      };
      return result;
    },
  }
);
