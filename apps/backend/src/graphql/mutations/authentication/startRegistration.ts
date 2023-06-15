import { serverRegistrationStart } from "@serenity-kit/opaque";
import { UserInputError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { z } from "zod";

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
    try {
      z.string().email().parse(args.input.username);
    } catch (error) {
      throw new UserInputError("Invalid email address");
    }

    if (!process.env.OPAQUE_SERVER_SETUP) {
      throw new Error("Missing process.env.OPAQUE_SERVER_SETUP");
    }

    const result = serverRegistrationStart({
      userIdentifier: args.input.username,
      registrationRequest: args.input.challenge,
      serverSetup: process.env.OPAQUE_SERVER_SETUP,
    });

    return {
      challengeResponse: result,
    };
  },
});
