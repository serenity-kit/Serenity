import sodium from "@serenity-tools/libsodium";
import { AuthenticationError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";

export const VerifyPasswordInput = inputObjectType({
  name: "VerifyPasswordInput",
  definition(t) {
    t.nonNull.string("loginId");
    t.nonNull.string("message");
    t.nonNull.string("sessionTokenSignature");
    t.nonNull.string("deviceSigningPublicKey");
  },
});

export const VerifyLoginResult = objectType({
  name: "VerifyLoginResult",
  definition(t) {
    t.boolean("isValid");
  },
});

export const verifyLoginMutation = mutationField("verifyPassword", {
  type: VerifyLoginResult,
  args: {
    input: nonNull(
      arg({
        type: VerifyPasswordInput,
      })
    ),
  },
  async resolve(_root, args, context) {
    if (!context.user) {
      throw new AuthenticationError("Not authenticated");
    }
    context.assertValidDeviceSigningPublicKeyForThisSession(
      args.input.deviceSigningPublicKey
    );
    const isValidSessionTokenSignature =
      await sodium.crypto_sign_verify_detached(
        args.input.sessionTokenSignature,
        context.session.sessionKey,
        args.input.deviceSigningPublicKey
      );
    return {
      isValid: isValidSessionTokenSignature,
    };
  },
});
