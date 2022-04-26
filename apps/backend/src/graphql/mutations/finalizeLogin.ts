import { arg, inputObjectType, mutationField, objectType } from "nexus";
import sodium from "libsodium-wrappers-sumo";
import { prisma } from "../../database/prisma";
import { finalizeLogin } from "../../database/authentication/finalizeLogin";

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
    const username = args?.input?.username;
    if (!username) {
      throw Error('Missing parameter: "username" must be string');
    }
    const responseData = await finalizeLogin(username);
    return responseData;
  },
});
