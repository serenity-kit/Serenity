import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { finalizeLogin } from "../../../database/authentication/finalizeLogin";
import { finishLogin } from "../../../utils/opaque";

export const ClientOprfLoginFinalizeInput = inputObjectType({
  name: "ClientOprfLoginFinalizeInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("message");
  },
});

export const ClientOprfLoginFinalizeResult = objectType({
  name: "ClientOprfLoginFinalizeResult",
  definition(t) {
    t.boolean("success");
  },
});

export const finalizeLoginMutation = mutationField("finalizeLogin", {
  type: ClientOprfLoginFinalizeResult,
  args: {
    input: arg({
      type: ClientOprfLoginFinalizeInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args || !args.input) {
      throw Error("Missing input");
    }
    const sessionKey = await finishLogin(
      args.input.username,
      args.input.message
    );
    console.log("SESSION KEY", sessionKey);
    // const responseData = await finalizeLogin(username);

    return { success: true };
  },
});
