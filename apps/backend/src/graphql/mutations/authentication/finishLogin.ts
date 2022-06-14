import { arg, inputObjectType, mutationField, objectType } from "nexus";
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
    t.boolean("success");
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
      throw Error("Missing input");
    }
    const sessionKey = finishLogin({
      loginId: args.input.loginId,
      message: args.input.message,
    });
    console.log("SESSION KEY", sessionKey);
    // TODO store the session key in the database

    return { success: true };
  },
});
