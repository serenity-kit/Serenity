import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { finalizePasswordReset } from "../../database/authentication/finalizePasswordReset";

export const FinalizeResetPasswordInput = inputObjectType({
  name: "FinalizeResetPasswordInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("token");
    t.nonNull.string("secret");
    t.nonNull.string("nonce");
    t.nonNull.string("clientPublicKey");
  },
});

export const FinalizeResetPasswordResult = objectType({
  name: "FinalizeResetPasswordResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const finalizePasswordResetMutation = mutationField(
  "finalizePasswordReset",
  {
    type: FinalizeResetPasswordResult,
    args: {
      input: arg({
        type: FinalizeResetPasswordInput,
      }),
    },
    async resolve(root, args, context) {
      if (!args || !args.input) {
        throw new Error("Missing input");
      }
      const username = args.input.username;
      const token = args.input.token;
      const secret = args.input.secret;
      const nonce = args.input.nonce;
      const clientPublicKey = args.input.clientPublicKey;
      finalizePasswordReset(username, token, secret, nonce, clientPublicKey);
      const result = {
        status: "success",
      };
      return result;
    },
  }
);
