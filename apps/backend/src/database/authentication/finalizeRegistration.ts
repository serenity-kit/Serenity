import * as userChain from "@serenity-kit/user-chain";
import { UserInputError } from "apollo-server-express";
import { ServerClient } from "postmark";
import { Prisma } from "../../../prisma/generated/output";
import { createConfirmationCode } from "../../utils/confirmationCode";
import { ExpectedGraphqlError } from "../../utils/expectedGraphqlError/expectedGraphqlError";
import { prisma } from "../prisma";

if (!process.env.FROM_EMAIL) {
  throw new Error("Missing process.env.FROM_EMAIL");
}
if (!process.env.POSTMARK_API_KEY) {
  throw new Error("Missing process.env.POSTMARK_API_KEY");
}
const postmarkClient = new ServerClient(process.env.POSTMARK_API_KEY);

type DeviceInput = {
  ciphertext: string;
  nonce: string;
};

type Props = {
  registrationRecord: string;
  encryptedMainDevice: DeviceInput;
  pendingWorkspaceInvitationId: string | null | undefined;
  pendingWorkspaceInvitationKeySubkeyId: number | null | undefined;
  pendingWorkspaceInvitationKeyCiphertext: string | null | undefined;
  pendingWorkspaceInvitationKeyPublicNonce: string | null | undefined;
  createChainEvent: userChain.CreateUserChainEvent;
};

export async function finalizeRegistration({
  registrationRecord,
  encryptedMainDevice,
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
    return await prisma.$transaction(
      async (prisma) => {
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
            mainDeviceCiphertext: encryptedMainDevice.ciphertext,
            mainDeviceNonce: encryptedMainDevice.nonce,
            mainDeviceSigningPublicKey:
              userChainState.currentState.mainDeviceSigningPublicKey,
            mainDeviceEncryptionPublicKey:
              userChainState.currentState.mainDeviceEncryptionPublicKey,
            mainDeviceEncryptionPublicKeySignature:
              userChainState.currentState
                .mainDeviceEncryptionPublicKeySignature,
            pendingWorkspaceInvitationId,
            pendingWorkspaceInvitationKeySubkeyId,
            pendingWorkspaceInvitationKeyCiphertext,
            pendingWorkspaceInvitationKeyPublicNonce,
            createChainEvent,
          },
        });

        // TODO: consider including user-set flag to trigger universal link
        // when the user is on a mobile device
        let rootUrl = "http://localhost:19006/";
        if (process.env.SERENITY_ENV === "e2e") {
          rootUrl = "http://localhost:19006/";
        }
        if (process.env.SERENITY_ENV === "staging") {
          rootUrl = "https://www.serenity.li/";
        }
        if (process.env.SERENITY_ENV === "production") {
          rootUrl = "https://www.serenityapp.page/";
        }
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
        if (
          process.env.SERENITY_ENV === "e2e" ||
          process.env.SERENITY_ENV === "development" ||
          process.env.SERENITY_ENV === "staging"
        ) {
          console.log(
            `New user confirmation code: ${unverifiedUser.confirmationCode}`
          );
        } else {
          console.log(`Sending verification email to "${username}"`);
          try {
            await postmarkClient.sendEmail({
              From: process.env.FROM_EMAIL!,
              To: username,
              Subject: "Verify your Serenity account",
              HtmlBody: emailRegistrationLines.join("<br />"),
              TextBody: emailRegistrationLines.join("\n"),
              MessageStream: "outbound",
            });
          } catch (error) {
            console.error(`Error sending email to "${username}"`);
            console.error("Postmark error:");
            console.error(error);
          }
        }

        return unverifiedUser;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error) {
    console.error("Error saving user");
    console.log(error);
    throw error;
  }
}
