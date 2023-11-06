import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { LocalDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";
import { prisma } from "../../../src/database/prisma";
import { getWorkspaceMemberDevicesProofByWorkspaceId } from "../../../src/database/workspace/getWorkspaceMemberDevicesProofByWorkspaceId";

type Params = {
  graphql: any;
  workspaceChainEvent: workspaceChain.WorkspaceChainEvent;
  authorizationHeader: string;
  workspaceId: string;
  mainDevice: LocalDevice;
};

export const deleteWorkspaceInvitations = async ({
  graphql,
  authorizationHeader,
  workspaceChainEvent,
  workspaceId,
  mainDevice,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation deleteWorkspaceInvitations(
      $input: DeleteWorkspaceInvitationsInput!
    ) {
      deleteWorkspaceInvitations(input: $input) {
        status
      }
    }
  `;

  const existingEntry = await getWorkspaceMemberDevicesProofByWorkspaceId({
    prisma,
    workspaceId,
  });

  const workspaceMemberDevicesProofData: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData =
    {
      clock: existingEntry.proof.clock + 1,
      userChainHashes: existingEntry.data.userChainHashes,
      workspaceChainHash: workspaceChain.hashTransaction(
        workspaceChainEvent.transaction
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
        serializedWorkspaceChainEvent: JSON.stringify(workspaceChainEvent),
        serializedWorkspaceMemberDevicesProof: JSON.stringify(newProof),
      },
    },
    authorizationHeaders
  );
  return result;
};
