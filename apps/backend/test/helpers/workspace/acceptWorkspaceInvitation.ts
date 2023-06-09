import * as workspaceChain from "@serenity-kit/workspace-chain";
import { LocalDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { prisma } from "../../../src/database/prisma";
import { getLastWorkspaceChainEvent } from "./getLastWorkspaceChainEvent";

type Params = {
  graphql: any;
  invitationId: string;
  inviteeMainDevice: LocalDevice;
  authorizationHeader: string;
  invitationSigningKeyPairSeed: string;
  overwriteInvitationId?: string;
};

export const acceptWorkspaceInvitation = async ({
  graphql,
  invitationId,
  inviteeMainDevice,
  authorizationHeader,
  invitationSigningKeyPairSeed,
  overwriteInvitationId,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation acceptWorkspaceInvitation(
      $input: AcceptWorkspaceInvitationInput!
    ) {
      acceptWorkspaceInvitation(input: $input) {
        workspaceId
      }
    }
  `;

  const workspaceInvitation =
    await prisma.workspaceInvitations.findUniqueOrThrow({
      where: { id: invitationId },
    });

  const { lastChainEntry } = await getLastWorkspaceChainEvent({
    workspaceId: workspaceInvitation.workspaceId,
  });
  const prevHash = workspaceChain.hashTransaction(lastChainEntry.transaction);

  const acceptInvitationEvent = workspaceChain.acceptInvitation({
    prevHash,
    invitationSigningKeyPairSeed: invitationSigningKeyPairSeed,
    expiresAt: workspaceInvitation.expiresAt,
    invitationId,
    role: workspaceInvitation.role,
    workspaceId: workspaceInvitation.workspaceId,
    invitationDataSignature: workspaceInvitation.invitationDataSignature,
    invitationSigningPublicKey: workspaceInvitation.invitationSigningPublicKey,
    authorKeyPair: {
      keyType: "ed25519",
      privateKey: sodium.from_base64(inviteeMainDevice.signingPrivateKey),
      publicKey: sodium.from_base64(inviteeMainDevice.signingPublicKey),
    },
  });

  const result = await graphql.client.request(
    query,
    {
      input: {
        serializedWorkspaceChainEvent: JSON.stringify(acceptInvitationEvent),
      },
    },
    authorizationHeaders
  );
  return result;
};
