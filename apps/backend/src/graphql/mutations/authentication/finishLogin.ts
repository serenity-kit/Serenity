import { verifyDevice } from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { UserInputError } from "apollo-server-express";
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
    t.nonNull.string("deviceSigningPublicKey");
    t.nonNull.string("deviceEncryptionPublicKey");
    t.nonNull.string("deviceEncryptionPublicKeySignature");
    t.nonNull.string("deviceInfo");
    t.nonNull.string("sessionTokenSignature");
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
    try {
      verifyDevice({
        signingPublicKey: args.input.deviceSigningPublicKey,
        encryptionPublicKey: args.input.deviceEncryptionPublicKey,
        encryptionPublicKeySignature:
          args.input.deviceEncryptionPublicKeySignature,
      });
    } catch (error) {
      throw new UserInputError(
        "Invalid input: encryptionPublicKeySignature verification failed"
      );
    }

    const finishLoginResult = finishLogin({
      loginId: args.input.loginId,
      message: args.input.message,
    });

    const isValidSessionTokenSignature =
      await sodium.crypto_sign_verify_detached(
        args.input.sessionTokenSignature,
        finishLoginResult.sessionKey,
        args.input.deviceSigningPublicKey
      );
    if (!isValidSessionTokenSignature) {
      throw new Error("Invalid sessionTokenSignature");
    }

    const session = await createSession({
      username: finishLoginResult.username,
      sessionKey: finishLoginResult.sessionKey,
      expiresAt: addDays(new Date(), 30),
      device: {
        signingPublicKey: args.input.deviceSigningPublicKey,
        encryptionPublicKey: args.input.deviceEncryptionPublicKey,
        encryptionPublicKeySignature:
          args.input.deviceEncryptionPublicKeySignature,
        info: args.input.deviceInfo,
      },
    });

    return {
      expiresAt: session.expiresAt,
    };
  },
});
