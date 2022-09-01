import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
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
    input: nonNull(
      arg({
        type: StartRegistrationInput,
      })
    ),
  },
  async resolve(root, args) {
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
