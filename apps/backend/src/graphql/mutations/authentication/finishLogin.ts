import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { createSession } from "../../../database/authentication/createSession";
import { getUserByUsername } from "../../../database/user/getUserByUsername";
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
    t.date("expiresAt");
  },
});

export const addDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const finishLoginMutation = mutationField("finishLogin", {
  type: FinishLoginResult,
  args: {
    input: arg({
      type: FinishLoginInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args || !args.input) {
      throw Error("Missing input");
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
