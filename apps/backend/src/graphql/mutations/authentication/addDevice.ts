import * as userChain from "@serenity-kit/user-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { ForbiddenError, UserInputError } from "apollo-server-express";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import sodium from "react-native-libsodium";
import { createSessionAndDevice } from "../../../database/authentication/createSessionAndDevice";
import { getLoginAttempt } from "../../../database/authentication/getLoginAttempt";
import { WorkspaceMemberDevicesProofEntryInput } from "../../types/workspaceMemberDevicesProof";

export const AddDeviceInput = inputObjectType({
  name: "AddDeviceInput",
  definition(t) {
    t.nonNull.string("loginId");
    t.nonNull.string("deviceSigningPublicKey");
    t.nonNull.string("deviceEncryptionPublicKey");
    t.nonNull.string("deviceEncryptionPublicKeySignature");
    t.nonNull.string("deviceInfo");
    t.nonNull.string("sessionTokenSignature");
    t.nonNull.string("deviceType");
    t.nonNull.string("serializedUserChainEvent");
    t.nonNull.list.nonNull.field("workspaceMemberDevicesProofs", {
      type: WorkspaceMemberDevicesProofEntryInput,
    });
    t.string("webDeviceCiphertext");
    t.string("webDeviceNonce");
  },
});

export const AddDeviceResult = objectType({
  name: "AddDeviceResult",
  definition(t) {
    t.field("expiresAt", { type: nonNull("Date") });
    t.string("webDeviceAccessToken");
  },
});

export const addDeviceMutation = mutationField("addDevice", {
  type: AddDeviceResult,
  args: {
    input: nonNull(
      arg({
        type: AddDeviceInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!context.authorizationHeader) {
      throw new ForbiddenError("Unauthorized");
    }
    const sessionKey = context.authorizationHeader;

    if (!process.env.OPAQUE_SERVER_SETUP) {
      throw new Error("Missing process.env.OPAQUE_SERVER_SETUP");
    }

    try {
      userChain.verifyDevice({
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

    const loginAttempt = await getLoginAttempt({
      loginAttemptId: args.input.loginId,
    });

    if (
      loginAttempt.sessionKey === null ||
      loginAttempt.sessionKey !== sessionKey
    ) {
      throw new ForbiddenError("Unauthorized");
    }

    const isValidSessionTokenSignature = sodium.crypto_sign_verify_detached(
      sodium.from_base64(args.input.sessionTokenSignature),
      "login_session_key" + sessionKey,
      sodium.from_base64(args.input.deviceSigningPublicKey)
    );
    if (!isValidSessionTokenSignature) {
      throw new Error("Invalid sessionTokenSignature");
    }

    const addDeviceEvent = userChain.AddDeviceEvent.parse(
      JSON.parse(args.input.serializedUserChainEvent)
    );

    const workspaceMemberDevicesProofEntries =
      args.input.workspaceMemberDevicesProofs.map((entry) => {
        return {
          workspaceId: entry.workspaceId,
          workspaceMemberDevicesProof:
            workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof.parse(
              JSON.parse(entry.serializedWorkspaceMemberDevicesProof)
            ),
        };
      });

    const session = await createSessionAndDevice({
      username: loginAttempt.username,
      sessionKey: sessionKey,
      device: {
        signingPublicKey: args.input.deviceSigningPublicKey,
        encryptionPublicKey: args.input.deviceEncryptionPublicKey,
        encryptionPublicKeySignature:
          args.input.deviceEncryptionPublicKeySignature,
        info: args.input.deviceInfo,
      },
      addDeviceEvent,
      deviceType: args.input.deviceType,
      webDeviceCiphertext: args.input.webDeviceCiphertext || undefined,
      webDeviceNonce: args.input.webDeviceNonce || undefined,
      workspaceMemberDevicesProofEntries,
    });

    return {
      expiresAt: session.expiresAt,
      webDeviceAccessToken: session.device.webDeviceAccessToken,
    };
  },
});
