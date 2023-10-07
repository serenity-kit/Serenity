import sendgrid from "@sendgrid/mail";
import * as userChain from "@serenity-kit/user-chain";
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
};

type Props = {
  registrationRecord: string;
  mainDevice: DeviceInput;
  pendingWorkspaceInvitationId: string | null | undefined;
  pendingWorkspaceInvitationKeySubkeyId: number | null | undefined;
  pendingWorkspaceInvitationKeyCiphertext: string | null | undefined;
  pendingWorkspaceInvitationKeyPublicNonce: string | null | undefined;
  createChainEvent: userChain.CreateUserChainEvent;
};

export async function finalizeRegistration({
  registrationRecord,
  mainDevice,
  pendingWorkspaceInvitationId,
  pendingWorkspaceInvitationKeySubkeyId,
  pendingWorkspaceInvitationKeyCiphertext,
  pendingWorkspaceInvitationKeyPublicNonce,
  createChainEvent,
}: Props) {
  const userChainState = userChain.resolveState({
    events: [createChainEvent],
    knownVersion: userChain.version,
  });
  const username = userChainState.currentState.email;
  if (
    mainDevice.signingPublicKey !==
    userChainState.currentState.mainDeviceSigningPublicKey
  ) {
    throw new UserInputError(
      "mainDevice and createChainEvent signing keys don't match"
    );
  }

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
          registrationRecord,
          mainDeviceCiphertext: mainDevice.ciphertext,
          mainDeviceNonce: mainDevice.nonce,
          mainDeviceSigningPublicKey: mainDevice.signingPublicKey,
          mainDeviceEncryptionPublicKey: mainDevice.encryptionPublicKey,
          mainDeviceEncryptionPublicKeySignature:
            mainDevice.encryptionPublicKeySignature,
          pendingWorkspaceInvitationId,
          pendingWorkspaceInvitationKeySubkeyId,
          pendingWorkspaceInvitationKeyCiphertext,
          pendingWorkspaceInvitationKeyPublicNonce,
          createChainEvent,
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
        process.env.NODE_ENV !== "development" &&
        process.env.NODE_ENV !== "test"
      ) {
        console.log(`Sending verification email to "${username}"`);
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
