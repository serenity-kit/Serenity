import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { confirmUser } from "../../../database/authentication/confirmUser";

export const VerifyRegistrationInput = inputObjectType({
  name: "VerifyRegistrationInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("verificationCode");
  },
});

export const VerifyRegistrationResult = objectType({
  name: "VerifyRegistrationResult",
  definition(t) {
    t.nonNull.string("id");
  },
});

export const verifyRegistrationMutation = mutationField("verifyRegistration", {
  type: VerifyRegistrationResult,
  args: {
    input: arg({
      type: VerifyRegistrationInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args || !args.input) {
      throw new Error("Missing input");
    }
    const user = await confirmUser({
      username: args.input.username,
      confirmationCode: args.input.verificationCode,
    });

    return { id: user.id };
  },
});
