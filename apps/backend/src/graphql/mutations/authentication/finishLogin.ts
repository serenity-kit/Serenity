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
    input: nonNull(
      arg({
        type: FinishLoginInput,
      })
    ),
  },
  async resolve(root, args, context) {
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
