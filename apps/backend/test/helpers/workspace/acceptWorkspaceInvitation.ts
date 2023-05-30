import * as workspaceChain from "@serenity-kit/workspace-chain";
import { LocalDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { prisma } from "../../../src/database/prisma";

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
        workspace {
          id
          name
          members {
            userId
            username
            role
          }
        }
      }
    }
  `;

  const workspaceInvitation =
    await prisma.workspaceInvitations.findUniqueOrThrow({
      where: { id: invitationId },
    });

  const { acceptInvitationSignature, acceptInvitationAuthorSignature } =
    workspaceChain.acceptInvitation({
      invitationSigningKeyPairSeed: invitationSigningKeyPairSeed,
      expiresAt: workspaceInvitation.expiresAt,
      invitationId,
      role: workspaceInvitation.role,
      workspaceId: workspaceInvitation.workspaceId,
      invitationDataSignature: workspaceInvitation.invitationDataSignature,
      invitationSigningPublicKey:
        workspaceInvitation.invitationSigningPublicKey,
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
        invitationId: overwriteInvitationId
          ? overwriteInvitationId
          : invitationId,
        acceptInvitationSignature: sodium.to_base64(acceptInvitationSignature),
        acceptInvitationAuthorSignature: sodium.to_base64(
          acceptInvitationAuthorSignature
        ),
        inviteeMainDeviceSigningPublicKey: inviteeMainDevice.signingPublicKey,
      },
    },
    authorizationHeaders
  );
  return result;
};
