import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
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
    input: nonNull(
      arg({
        type: VerifyRegistrationInput,
      })
    ),
  },
  async resolve(root, args, context) {
    const user = await verifyRegistration({
      username: args.input.username,
      confirmationCode: args.input.verificationCode,
    });

    return { id: user.id };
  },
});
