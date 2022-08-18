import { UserInputError } from "apollo-server-express";
import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { getEnvelope } from "../../../database/authentication/getEnvelope";
import { startLogin } from "../../../utils/opaque";

export const StartLoginInput = inputObjectType({
  name: "StartLoginInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("challenge");
  },
});

export const StartLoginResult = objectType({
  name: "StartLoginResult",
  definition(t) {
    t.nonNull.string("loginId");
    t.nonNull.string("challengeResponse");
  },
});

export const startLoginMutation = mutationField("startLogin", {
  type: StartLoginResult,
  args: {
    input: arg({
      type: StartLoginInput,
    }),
  },
  async resolve(root, args, context) {
    console.log({ args });
    if (!args || !args.input) {
      throw new UserInputError("Missing input");
    }
    if (!args.input.username) {
      throw new UserInputError("Invalid input: username cannot be null");
    }
    if (!args.input.challenge) {
      throw new UserInputError("Invalid input: challenge cannot be null");
    }
    const username = args.input.username;
    const result = await getEnvelope(username);
    try {
      const challengeResponse = startLogin({
        envelope: result.envelop,
        username,
        challenge: args.input.challenge,
      });
      return {
        loginId: challengeResponse.loginId,
        challengeResponse: challengeResponse.message,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to initiate login.");
    }
  },
});
