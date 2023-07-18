import { server } from "@serenity-kit/opaque";
import { UserInputError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { z } from "zod";
import { createLoginAttempt } from "../../../database/authentication/createLoginAttempt";
import { getEnvelope } from "../../../database/authentication/getEnvelope";

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
      console.log(`Invalid email address: ${username}`);
      throw new UserInputError("Input error: invalid email address");
    }
    let result: any = undefined;

    if (!process.env.OPAQUE_SERVER_SETUP) {
      throw new Error("Missing process.env.OPAQUE_SERVER_SETUP");
    }

    try {
      result = await getEnvelope(username);
    } catch (error) {
      throw new Error("Failed to initiate login");
    }
    try {
      const serverLoginStartResult = server.startLogin({
        registrationRecord: result.envelop,
        userIdentifier: username,
        serverSetup: process.env.OPAQUE_SERVER_SETUP,
        startLoginRequest: args.input.challenge,
      });

      const loginAttempt = await createLoginAttempt({
        username,
        startLoginServerData: serverLoginStartResult.serverLoginState,
      });

      return {
        loginId: loginAttempt.id,
        challengeResponse: serverLoginStartResult.loginResponse,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to initiate login.");
    }
  },
});
