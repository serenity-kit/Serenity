import { verifyDevice } from "@serenity-tools/common";
import { UserInputError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import sodium from "react-native-libsodium";
import { createSession } from "../../../database/authentication/createSession";
import { addDays } from "../../../utils/addDays/addDays";
import { addYears } from "../../../utils/addYears/addYears";
import { finishLogin } from "../../../utils/opaque";

export const deviceTypes = ["temporary-web", "web", "mobile"] as const;

export type DeviceType = typeof deviceTypes[number];

function isDeviceType(value: string): value is DeviceType {
  return deviceTypes.includes(value as DeviceType);
}

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
    t.nonNull.string("deviceType");
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
    if (!isDeviceType(args.input.deviceType)) {
      throw new UserInputError(
        "Invalid input: deviceType must be either temporary-web, web or mobile"
      );
    }

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

    const isValidSessionTokenSignature = sodium.crypto_sign_verify_detached(
      sodium.from_base64(args.input.sessionTokenSignature),
      finishLoginResult.sessionKey,
      sodium.from_base64(args.input.deviceSigningPublicKey)
    );
    if (!isValidSessionTokenSignature) {
      throw new Error("Invalid sessionTokenSignature");
    }

    let expiresAt = new Date();
    if (args.input.deviceType === "temporary-web") {
      expiresAt = addDays(new Date(), 1);
    } else if (args.input.deviceType === "web") {
      expiresAt = addDays(new Date(), 30);
    } else if (args.input.deviceType === "mobile") {
      expiresAt = addYears(new Date(), 1000);
    }

    const session = await createSession({
      username: finishLoginResult.username,
      sessionKey: finishLoginResult.sessionKey,
      expiresAt,
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
