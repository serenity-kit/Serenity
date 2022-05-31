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
      throw Error("Missing input");
    }
    const username = args.input.username;
    if (username === "") {
      throw Error("Username cannot be empty.");
    }
    if (args.input.challenge === "") {
      throw Error("Challenge cannot be empty.");
    }
    const result = await startRegistration(username, args.input.challenge);
    return {
      registrationId: result.registrationId,
      challengeResponse: result.response,
    };
  },
});
