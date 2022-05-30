import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { finishRegistration } from "../../../utils/opaque";
import { finalizeRegistration } from "../../../database/authentication/finalizeRegistration";

export const ClientOprfRegistrationFinalizeInput = inputObjectType({
  name: "ClientOprfRegistrationFinalizeInput",
  definition(t) {
    t.nonNull.string("message");
    t.nonNull.string("username");
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
      const envelope = await finishRegistration(username, args.input.message);
      await finalizeRegistration(username, envelope, args.input.workspaceId);
      return { status: "success" };
    },
  }
);
