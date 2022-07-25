import { UserInputError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { createSession } from "../../../database/authentication/createSession";
import { addDays } from "../../../utils/addDays/addDays";
import { finishLogin } from "../../../utils/opaque";

export const FinishLoginInput = inputObjectType({
  name: "FinishLoginInput",
  definition(t) {
    t.nonNull.string("loginId");
    t.nonNull.string("message");
  },
});

export const FinishLoginResult = objectType({
  name: "FinishLoginResult",
  definition(t) {
    t.field("expiresAt", { type: nonNull("Date") });
  },
});

export const finishLoginMutation = mutationField("finishLogin", {
  type: FinishLoginResult,
  args: {
    input: arg({
      type: FinishLoginInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args || !args.input) {
      throw new UserInputError("Missing input");
    }
    if (!args.input.loginId) {
      throw new UserInputError("Invalid input: loginId cannot be null");
    }
    if (!args.input.message) {
      throw new UserInputError("Invalid input: message cannot be null");
    }
    const finishLoginResult = finishLogin({
      loginId: args.input.loginId,
      message: args.input.message,
    });

    const session = await createSession({
      username: finishLoginResult.username,
      sessionKey: finishLoginResult.sessionKey,
      expiresAt: addDays(new Date(), 30),
    });

    return {
      expiresAt: session.expiresAt,
    };
  },
});
