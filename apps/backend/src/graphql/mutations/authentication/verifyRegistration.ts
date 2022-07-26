import { UserInputError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { verifyRegistration } from "../../../database/authentication/verifyRegistration";

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
      throw new UserInputError("Input missing");
    }
    if (!args.input.username) {
      throw new UserInputError("Invalid input: username cannot be null");
    }
    if (!args.input.verificationCode) {
      throw new UserInputError(
        "Invalid input: verificationCode cannot be null"
      );
    }
    const user = await verifyRegistration({
      username: args.input.username,
      confirmationCode: args.input.verificationCode,
    });

    return { id: user.id };
  },
});
