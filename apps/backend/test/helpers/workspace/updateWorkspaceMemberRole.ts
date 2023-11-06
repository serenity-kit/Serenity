import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { LocalDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";
import { prisma } from "../../../src/database/prisma";
import { getWorkspaceMemberDevicesProofByWorkspaceId } from "../../../src/database/workspace/getWorkspaceMemberDevicesProofByWorkspaceId";

type Params = {
  graphql: any;
  workspaceId: string;
  authorizationHeader: string;
  workspaceChainEvent: workspaceChain.WorkspaceChainEvent;
  mainDevice: LocalDevice;
};

export const updateWorkspaceMemberRole = async ({
  graphql,
  workspaceId,
  workspaceChainEvent,
  authorizationHeader,
  mainDevice,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

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

  const query = gql`
    mutation updateWorkspaceMemberRole(
      $input: UpdateWorkspaceMemberRoleInput!
    ) {
      updateWorkspaceMemberRole(input: $input) {
        workspace {
          id
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        workspaceId,
        serializedWorkspaceChainEvent: JSON.stringify(workspaceChainEvent),
        serializedWorkspaceMemberDevicesProof: JSON.stringify(newProof),
      },
    },
    authorizationHeaders
  );
  return result;
};
