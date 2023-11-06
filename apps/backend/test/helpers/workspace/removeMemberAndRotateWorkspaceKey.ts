import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { LocalDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "libsodium-wrappers";
import { prisma } from "../../../src/database/prisma";
import { getWorkspaceMemberDevicesProofByWorkspaceId } from "../../../src/database/workspace/getWorkspaceMemberDevicesProofByWorkspaceId";
import { WorkspaceDeviceParing } from "../../../src/types/workspaceDevice";

type Params = {
  graphql: any;
  workspaceId: string;
  creatorDeviceSigningPublicKey: string;
  deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[];
  authorizationHeader: string;
  workspaceChainEvent: workspaceChain.WorkspaceChainEvent;
  mainDevice: LocalDevice;
  userIdToRemove: string;
};

export const removeMemberAndRotateWorkspaceKey = async ({
  graphql,
  workspaceId,
  creatorDeviceSigningPublicKey,
  deviceWorkspaceKeyBoxes,
  authorizationHeader,
  workspaceChainEvent,
  mainDevice,
  userIdToRemove,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  const existingEntry = await getWorkspaceMemberDevicesProofByWorkspaceId({
    prisma,
    workspaceId,
  });

  const userChainHashes = { ...existingEntry.data.userChainHashes };
  delete userChainHashes[userIdToRemove];

  const workspaceMemberDevicesProofData: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData =
    {
      clock: existingEntry.proof.clock + 1,
      userChainHashes,
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
    mutation removeMemberAndRotateWorkspaceKey(
      $input: RemoveMemberAndRotateWorkspaceKeyInput!
    ) {
      removeMemberAndRotateWorkspaceKey(input: $input) {
        workspaceKey {
          id
          generation
          workspaceId
          workspaceKeyBoxes {
            id
            deviceSigningPublicKey
            creatorDeviceSigningPublicKey
            ciphertext
            nonce
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        creatorDeviceSigningPublicKey,
        workspaceId,
        deviceWorkspaceKeyBoxes,
        serializedWorkspaceChainEvent: JSON.stringify(workspaceChainEvent),
        serializedWorkspaceMemberDevicesProof: JSON.stringify(newProof),
      },
    },
    authorizationHeaders
  );
  return result;
};
