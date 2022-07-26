import { UserInputError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { startRegistration } from "../../../utils/opaque";

export const StartRegistrationInput = inputObjectType({
  name: "StartRegistrationInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("challenge");
  },
});

export const StartRegistrationResult = objectType({
  name: "StartRegistrationResult",
  definition(t) {
    t.nonNull.string("registrationId");
    t.nonNull.string("challengeResponse");
  },
});

export const startRegistrationMutation = mutationField("startRegistration", {
  type: StartRegistrationResult,
  args: {
    input: arg({
      type: StartRegistrationInput,
    }),
  },
  async resolve(root, args) {
    if (!args || !args.input) {
      throw new UserInputError("Missing input");
    }
    if (!args.input.username) {
      throw new UserInputError("Invalid input: username cannot be null");
    }
    if (!args.input.challenge) {
      throw new UserInputError("Invalid input: challenge cannot be null");
    }
    const result = startRegistration({
      username: args.input.username,
      challenge: args.input.challenge,
    });
    return {
      registrationId: result.registrationId,
      challengeResponse: result.response,
    };
  },
});
