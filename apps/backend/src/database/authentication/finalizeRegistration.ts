import sendgrid from "@sendgrid/mail";
import { UserInputError } from "apollo-server-express";
import { Device } from "../../types/device";
import { createConfirmationCode } from "../../utils/confirmationCode";
import { ExpectedGraphqlError } from "../../utils/expectedGraphqlError/expectedGraphqlError";
import { prisma } from "../prisma";
if (!process.env.FROM_EMAIL) {
  throw new Error("Missing process.env.FROM_EMAIL");
}
if (!process.env.SENDGRID_API_KEY) {
  throw new Error("Missing process.env.SENDGRID_API_KEY");
}
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

type DeviceInput = Device & {
  ciphertext: string;
  nonce: string;
  encryptionKeySalt: string;
};

type Props = {
  username: string;
  opaqueEnvelope: string;
  mainDevice: DeviceInput;
  pendingWorkspaceInvitationId: string | null | undefined;
  pendingWorkspaceInvitationKeySubkeyId: number | null | undefined;
  pendingWorkspaceInvitationKeyCiphertext: string | null | undefined;
  pendingWorkspaceInvitationKeyPublicNonce: string | null | undefined;
  pendingWorkspaceInvitationKeyEncryptionSalt: string | null | undefined;
};

export async function finalizeRegistration({
  username,
  opaqueEnvelope,
  mainDevice,
  pendingWorkspaceInvitationId,
  pendingWorkspaceInvitationKeySubkeyId,
  pendingWorkspaceInvitationKeyCiphertext,
  pendingWorkspaceInvitationKeyPublicNonce,
  pendingWorkspaceInvitationKeyEncryptionSalt,
}: Props) {
  if (pendingWorkspaceInvitationId && !pendingWorkspaceInvitationKeySubkeyId) {
    throw new UserInputError(
      "pendingWorkspaceInvitationId without workspaceInvitationKeySubkeyId"
    );
  }
  if (
    pendingWorkspaceInvitationId &&
    !pendingWorkspaceInvitationKeyCiphertext
  ) {
    throw new UserInputError(
      "pendingWorkspaceInvitationId without workspaceInvitationKeyCiphertext"
    );
  }
  if (
    pendingWorkspaceInvitationId &&
    !pendingWorkspaceInvitationKeyPublicNonce
  ) {
    throw new UserInputError(
      "pendingWorkspaceInvitationId without workspaceInvitationKeyPublicNonce"
    );
  }
  if (
    pendingWorkspaceInvitationId &&
    !pendingWorkspaceInvitationKeyEncryptionSalt
  ) {
    throw new UserInputError(
      "pendingWorkspaceInvitationId without pendingWorkspaceInvitationKeyEncryptionSalt"
    );
  }
  try {
    return await prisma.$transaction(async (prisma) => {
      // if this user has already completed registration, throw an error
      const existingUserData = await prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (existingUserData) {
        throw new ExpectedGraphqlError(
          "This email has already been registered."
        );
      }
      const confirmationCode = createConfirmationCode();
      const unverifiedUser = await prisma.unverifiedUser.create({
        data: {
          username,
          confirmationCode,
          opaqueEnvelope,
          mainDeviceCiphertext: mainDevice.ciphertext,
          mainDeviceNonce: mainDevice.nonce,
          mainDeviceSigningPublicKey: mainDevice.signingPublicKey,
          mainDeviceEncryptionKeySalt: mainDevice.encryptionKeySalt,
          mainDeviceEncryptionPublicKey: mainDevice.encryptionPublicKey,
          mainDeviceEncryptionPublicKeySignature:
            mainDevice.encryptionPublicKeySignature,
          pendingWorkspaceInvitationId,
          pendingWorkspaceInvitationKeySubkeyId,
          pendingWorkspaceInvitationKeyCiphertext,
          pendingWorkspaceInvitationKeyPublicNonce,
          pendingWorkspaceInvitationKeyEncryptionSalt,
        },
      });

      // TODO: consider including user-set flag to trigger universal link
      // when the user is on a mobile device
      const rootUrl =
        process.env.NODE_ENV === "development" ||
        process.env.SERENITY_ENV === "e2e"
          ? `http://localhost:19006/`
          : "https://www.serenity.li";
      const encodedUsername = encodeURIComponent(unverifiedUser.username);
      const encodedConfirmationCode = encodeURIComponent(
        unverifiedUser.confirmationCode
      );
      const emailRegistrationLink = `${rootUrl}registration-verification?username=${encodedUsername}&verification=${encodedConfirmationCode}`;
      const emailRegistrationLines = [
        `Welcome to Serenity!`,
        ``,
        `Please complete your registration by copying your verification code into the app:`,
        ``,
        `${unverifiedUser.confirmationCode}`,
        ``,
        `Alternatively you can visit ${emailRegistrationLink}`,
        ``,
        `If you didn't try to create an account, please ignore this email.`,
      ];
      const registrationEmail = {
        to: username,
        from: process.env.FROM_EMAIL!,
        subject: "Verify your Serenity account",
        text: emailRegistrationLines.join("\n"),
      };
      if (
        process.env.SERENITY_ENV !== "e2e" &&
        process.env.SERENITY_ENV !== "development"
      ) {
        console.log(`Sending verification email to "${username}"`);
        console.log(`Verification code: "${unverifiedUser.confirmationCode}"`);
        try {
          await sendgrid.send(registrationEmail);
        } catch (error) {
          console.error(`Error sending email to "${username}"`);
          console.error("Sendgrid error response body:");
          console.error(error.response.body);
          console.error("Sendgrid error:");
          console.error(error);
        }
      } else {
        console.log(
          `New user confirmation code: ${unverifiedUser.confirmationCode}`
        );
      }

      return unverifiedUser;
    });
  } catch (error) {
    console.error("Error saving user");
    console.log(error);
    throw error;
  }
}
