import { serverRegistrationFinish } from "@serenity-kit/opaque";
import {
  arg,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
} from "nexus";
import { finalizeRegistration } from "../../../database/authentication/finalizeRegistration";

export const FinishRegistrationDeviceInput = inputObjectType({
  name: "FinishRegistrationDeviceInput",
  definition(t) {
    t.nonNull.string("ciphertext");
    t.nonNull.string("nonce");
    t.nonNull.string("encryptionKeySalt");
    t.nonNull.string("signingPublicKey");
    t.nonNull.string("encryptionPublicKey");
    t.nonNull.string("encryptionPublicKeySignature");
  },
});

export const FinishRegistrationInput = inputObjectType({
  name: "FinishRegistrationInput",
  definition(t) {
    t.nonNull.string("message");
    t.nonNull.string("username");
    t.nonNull.field("mainDevice", { type: FinishRegistrationDeviceInput });
    t.string("pendingWorkspaceInvitationId");
    t.int("pendingWorkspaceInvitationKeySubkeyId");
    t.string("pendingWorkspaceInvitationKeyCiphertext");
    t.string("pendingWorkspaceInvitationKeyPublicNonce");
    t.string("pendingWorkspaceInvitationKeyEncryptionSalt");
  },
});

export const FinishRegistrationResult = objectType({
  name: "FinishRegistrationResult",
  definition(t) {
    t.nonNull.string("id");
    t.string("verificationCode"); // TODO remove once email verifiaction is implemented
  },
});

export const finishRegistrationMutation = mutationField("finishRegistration", {
  type: FinishRegistrationResult,
  args: {
    input: nonNull(
      arg({
        type: FinishRegistrationInput,
      })
    ),
  },
  async resolve(root, args, context) {
    if (!process.env.OPAQUE_SERVER_SETUP) {
      throw new Error("Missing process.env.OPAQUE_SERVER_SETUP");
    }

    const passwordFile = serverRegistrationFinish(args.input.message);

    const unverifiedUser = await finalizeRegistration({
      username: args.input.username,
      opaqueEnvelope: passwordFile,
      mainDevice: args.input.mainDevice,
      pendingWorkspaceInvitationId: args.input.pendingWorkspaceInvitationId,
      pendingWorkspaceInvitationKeySubkeyId:
        args.input.pendingWorkspaceInvitationKeySubkeyId,
      pendingWorkspaceInvitationKeyCiphertext:
        args.input.pendingWorkspaceInvitationKeyCiphertext,
      pendingWorkspaceInvitationKeyPublicNonce:
        args.input.pendingWorkspaceInvitationKeyPublicNonce,
      pendingWorkspaceInvitationKeyEncryptionSalt:
        args.input.pendingWorkspaceInvitationKeyEncryptionSalt,
    });
    return {
      id: unverifiedUser.id,
      verificationCode: unverifiedUser.confirmationCode,
    };
  },
});
