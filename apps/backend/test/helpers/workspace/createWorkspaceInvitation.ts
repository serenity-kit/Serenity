import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { LocalDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { Role } from "../../../prisma/generated/output";
import { prisma } from "../../../src/database/prisma";
import { getWorkspaceMemberDevicesProofByWorkspaceId } from "../../../src/database/workspace/getWorkspaceMemberDevicesProofByWorkspaceId";
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

  const existingEntry = await getWorkspaceMemberDevicesProofByWorkspaceId({
    prisma,
    workspaceId,
  });

  const workspaceMemberDevicesProofData: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData =
    {
      clock: existingEntry.proof.clock + 1,
      userChainHashes: existingEntry.data.userChainHashes,
      workspaceChainHash: workspaceChain.hashTransaction(
        invitation.transaction
      ),
    };

  const newProof =
    workspaceMemberDevicesProofUtil.createWorkspaceMemberDevicesProof({
      authorKeyPair: {
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
        keyType: "ed25519",
      },
      workspaceMemberDevicesProofData,
    });

  const result = await graphql.client.request(
    query,
    {
      input: {
        workspaceId,
        serializedWorkspaceChainEvent: JSON.stringify(invitation),
        serializedWorkspaceMemberDevicesProof: JSON.stringify(newProof),
      },
    },
    authorizationHeaders
  );

  return {
    ...result,
    invitationSigningKeyPairSeed: invitation.invitationSigningKeyPairSeed,
  };
};
