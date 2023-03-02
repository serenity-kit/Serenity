import { UserInputError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { z } from "zod";
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
    input: nonNull(
      arg({
        type: StartLoginInput,
      })
    ),
  },
  async resolve(root, args, context) {
    const username = args.input.username;
    try {
      z.string().email().parse(username);
    } catch (error) {
      throw new UserInputError("Input error: invalid email address");
    }
    let result: any = undefined;
    try {
      result = await getEnvelope(username);
    } catch (error) {
      throw new Error("Failed to initiate login");
    }
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
