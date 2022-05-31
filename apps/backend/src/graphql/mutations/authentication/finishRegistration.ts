import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { finishRegistration } from "../../../utils/opaque";
import { finalizeRegistration } from "../../../database/authentication/finalizeRegistration";

export const FinishRegistrationInput = inputObjectType({
  name: "FinishRegistrationInput",
  definition(t) {
    t.nonNull.string("message");
    t.nonNull.string("registrationId");
    t.nonNull.string("clientPublicKey");
    t.nonNull.string("workspaceId");
  },
});

export const FinishRegistrationResult = objectType({
  name: "FinishRegistrationResult",
  definition(t) {
    t.nonNull.string("id");
  },
});

export const finishRegistrationMutation = mutationField("finishRegistration", {
  type: FinishRegistrationResult,
  args: {
    input: arg({
      type: FinishRegistrationInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args || !args.input) {
      throw new Error("Missing input");
    }
    const { envelope, username } = await finishRegistration(
      args.input.registrationId,
      args.input.message
    );
    const user = await finalizeRegistration(
      username,
      envelope,
      args.input.workspaceId
    );
    return { id: user.id };
  },
});
