import { arg, inputObjectType, mutationField, objectType } from "nexus";
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
    t.boolean("success");
    t.nonNull.string("mainDeviceSigningPublicKey");
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
    const finishLoginResult = finishLogin({
      loginId: args.input.loginId,
      message: args.input.message,
    });

    console.log("SESSION KEY", finishLoginResult.sessionKey);
    // TODO store the session key in the database

    const user = await getUserByUsername(finishLoginResult.username);

    return {
      success: true,
      // temporarily until we replace it with a proper session
      mainDeviceSigningPublicKey: user?.mainDeviceSigningPublicKey,
    };
  },
});
