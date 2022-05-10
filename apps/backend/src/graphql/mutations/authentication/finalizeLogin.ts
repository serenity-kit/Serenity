import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { finalizeLogin } from "../../../database/authentication/finalizeLogin";

export const ClientOprfLoginFinalizeInput = inputObjectType({
  name: "ClientOprfLoginFinalizeInput",
  definition(t) {
    t.nonNull.string("username");
  },
});

export const ClientOprfLoginFinalizeeResult = objectType({
  name: "ClientOprfLoginFinalizeeResult",
  definition(t) {
    t.nonNull.string("oauthData");
    t.nonNull.string("nonce");
  },
});

export const finalizeLoginMutation = mutationField("finalizeLogin", {
  type: ClientOprfLoginFinalizeeResult,
  args: {
    input: arg({
      type: ClientOprfLoginFinalizeInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args || !args.input) {
      throw Error("Missing input");
    }
    const username = args.input.username;
    const responseData = await finalizeLogin(username);
    return responseData;
  },
});
