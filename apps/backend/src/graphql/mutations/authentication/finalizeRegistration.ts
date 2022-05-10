import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { finalizeRegistration } from "../../../database/authentication/finalizeRegistration";

export const ClientOprfRegistrationFinalizeInput = inputObjectType({
  name: "ClientOprfRegistrationFinalizeInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("secret");
    t.nonNull.string("nonce");
    t.nonNull.string("clientPublicKey");
    t.nonNull.string("workspaceId");
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
      if (!args || !args.input) {
        throw new Error("Missing input");
      }
      const username = args.input.username;
      const secret = args.input.secret;
      const nonce = args.input.nonce;
      const clientPublicKey = args.input.clientPublicKey;
      await finalizeRegistration(
        username,
        secret,
        nonce,
        clientPublicKey,
        args.input.workspaceId
      );
      const result = {
        status: "success",
      };
      return result;
    },
  }
);
