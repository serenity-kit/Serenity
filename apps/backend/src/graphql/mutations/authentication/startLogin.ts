import { ready as opaqueReady, server } from "@serenity-kit/opaque";
import { UserInputError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { createLoginAttempt } from "../../../database/authentication/createLoginAttempt";
import { getRegistrationRecord } from "../../../database/authentication/getEnvelope";

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

    if (!process.env.OPAQUE_SERVER_SETUP) {
      throw new Error("Missing process.env.OPAQUE_SERVER_SETUP");
    }
    await opaqueReady;

    try {
      const { envelop } = await getRegistrationRecord(username);
      const serverLoginStartResult = server.startLogin({
        registrationRecord: envelop,
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
      const serverLoginStartResult = server.startLogin({
        // creates a dummy response https://docs.rs/opaque-ke/latest/opaque_ke/#dummy-server-login
        registrationRecord: null,
        userIdentifier: username,
        serverSetup: process.env.OPAQUE_SERVER_SETUP,
        startLoginRequest: args.input.challenge,
      });
      return {
        loginId: uuidv4(),
        challengeResponse: serverLoginStartResult.loginResponse,
      };
    }
  },
});
