import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { finishRegistration } from "../../../utils/opaque";
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
    t.nonNull.string("registrationId");
    t.nonNull.string("clientPublicKey");
    t.nonNull.field("mainDevice", { type: FinishRegistrationDeviceInput });
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
      throw new Error("Missing input");
    }
    const { envelope, username } = finishRegistration({
      registrationId: args.input.registrationId,
      message: args.input.message,
    });

    const unverifiedUser = await finalizeRegistration({
      username,
      opaqueEnvelope: envelope,
      mainDevice: args.input.mainDevice,
    });
    return {
      id: unverifiedUser.id,
      verificationCode: unverifiedUser.confirmationCode,
    };
  },
});
