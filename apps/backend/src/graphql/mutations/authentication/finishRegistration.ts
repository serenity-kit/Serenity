import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { finishRegistration } from "../../../utils/opaque";
import { finalizeRegistration } from "../../../database/authentication/finalizeRegistration";
import { UserInputError } from "apollo-server-express";

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
    t.nonNull.string("registrationId");
    t.nonNull.field("mainDevice", { type: FinishRegistrationDeviceInput });
    t.string("pendingWorkspaceInvitationId");
  },
});

export const FinishRegistrationResult = objectType({
  name: "FinishRegistrationResult",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("verificationCode"); // TODO remove once email verifiaction is implemented
  },
});

export const finishRegistrationMutation = mutationField("finishRegistration", {
  type: FinishRegistrationResult,
  args: {
    input: arg({
      type: FinishRegistrationInput,
    }),
  },
  async resolve(root, args, context) {
    if (!args || !args.input) {
      throw new UserInputError("Missing input");
    }
    if (!args.input.message) {
      throw new UserInputError("Invalid input: message cannot be null");
    }
    if (!args.input.registrationId) {
      throw new UserInputError("Invalid input: registrationId cannot be null");
    }
    if (!args.input.mainDevice) {
      throw new UserInputError("Invalid input: mainDevice cannot be null");
    }
    if (!args.input.mainDevice.ciphertext) {
      throw new UserInputError(
        "Invalid input: mainDevice.ciphertext cannot be null"
      );
    }
    if (!args.input.mainDevice.nonce) {
      throw new UserInputError(
        "Invalid input: mainDevice.nonce cannot be null"
      );
    }
    if (!args.input.mainDevice.encryptionKeySalt) {
      throw new UserInputError(
        "Invalid input: mainDevice.encryptionKeySalt cannot be null"
      );
    }
    if (!args.input.mainDevice.signingPublicKey) {
      throw new UserInputError(
        "Invalid input: mainDevice.signingPublicKey cannot be null"
      );
    }
    if (!args.input.mainDevice.encryptionPublicKey) {
      throw new UserInputError(
        "Invalid input: mainDevice.encryptionPublicKey cannot be null"
      );
    }
    if (!args.input.mainDevice.encryptionPublicKeySignature) {
      throw new UserInputError(
        "Invalid input: mainDevice.encryptionPublicKeySignature cannot be null"
      );
    }
    const { envelope, username } = finishRegistration({
      registrationId: args.input.registrationId,
      message: args.input.message,
    });

    const unverifiedUser = await finalizeRegistration({
      username,
      opaqueEnvelope: envelope,
      mainDevice: args.input.mainDevice,
      pendingWorkspaceInvitationId: args.input.pendingWorkspaceInvitationId,
    });
    return {
      id: unverifiedUser.id,
      verificationCode: unverifiedUser.confirmationCode,
    };
  },
});
