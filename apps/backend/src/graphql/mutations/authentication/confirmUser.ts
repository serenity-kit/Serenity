import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { confirmUser } from "../../../database/authentication/confirmUser";

export const ConfirmUserInput = inputObjectType({
  name: "ConfirmUserInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("confirmationCode");
  },
});

export const ConfirmUserResult = objectType({
  name: "ConfirmUserResult",
  definition(t) {
    t.boolean("success");
  },
});

export const finishLoginMutation = mutationField("finishLogin", {
  type: ConfirmUserResult,
  args: {
    input: arg({
      type: ConfirmUserInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args || !args.input) {
      throw Error("Missing input");
    }
    await confirmUser({
      username: args.input.username,
      confirmationCode: args.input.confirmationCode,
    });
    return { success: true };
  },
});
