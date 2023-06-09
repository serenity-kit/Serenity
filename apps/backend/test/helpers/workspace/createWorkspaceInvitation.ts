import * as workspaceChain from "@serenity-kit/workspace-chain";
import { LocalDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { Role } from "../../../prisma/generated/output";
import { getLastWorkspaceChainEvent } from "./getLastWorkspaceChainEvent";

type Params = {
  graphql: any;
  workspaceId: string;
  role: Role;
  authorizationHeader: string;
  mainDevice: LocalDevice;
  overwritePrevHash?: string;
};

export const createWorkspaceInvitation = async ({
  graphql,
  workspaceId,
  role,
  authorizationHeader,
  mainDevice,
  overwritePrevHash,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation createWorkspaceInvitation(
      $input: CreateWorkspaceInvitationInput!
    ) {
      createWorkspaceInvitation(input: $input) {
        workspaceInvitation {
          id
          workspaceId
          inviterUserId
          role
          expiresAt
        }
      }
    }
  `;

  // expires 48 hours in the future
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  let invitation: workspaceChain.AddInvitationResult;
  if (overwritePrevHash) {
    invitation = workspaceChain.addInvitation({
      workspaceId,
      authorKeyPair: {
        keyType: "ed25519",
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
      },
      expiresAt,
      role,
      prevHash: overwritePrevHash,
    });
  } else {
    const { lastChainEntry } = await getLastWorkspaceChainEvent({
      workspaceId,
    });
    invitation = workspaceChain.addInvitation({
      workspaceId,
      authorKeyPair: {
        keyType: "ed25519",
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
      },
      expiresAt,
      role,
      prevHash: workspaceChain.hashTransaction(lastChainEntry.transaction),
    });
  }

  const result = await graphql.client.request(
    query,
    {
      input: {
        workspaceId,
        serializedWorkspaceChainEvent: JSON.stringify(invitation),
      },
    },
    authorizationHeaders
  );

  return {
    ...result,
    invitationSigningKeyPairSeed: invitation.invitationSigningKeyPairSeed,
  };
};
