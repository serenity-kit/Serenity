import * as userChain from "@serenity-kit/user-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import { LocalDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { getWorkspaceMemberDevicesProofs } from "../../../src/database/workspace/getWorkspaceMemberDevicesProofs";
import { WorkspaceWithWorkspaceDevicesParing } from "../../../src/types/workspaceDevice";
import { getLastUserChainEventByMainDeviceSigningPublicKey } from "../userChain/getLastUserChainEventByMainDeviceSigningPublicKey";
import { getLastWorkspaceChainEvent } from "../workspace/getLastWorkspaceChainEvent";

type Params = {
  graphql: any;
  creatorSigningPublicKey: string;
  newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[];
  deviceSigningPublicKeyToBeDeleted: string;
  authorizationHeader: string;
  mainDevice: LocalDevice;
};

export const deleteDevice = async ({
  graphql,
  creatorSigningPublicKey,
  newDeviceWorkspaceKeyBoxes,
  authorizationHeader,
  deviceSigningPublicKeyToBeDeleted,
  mainDevice,
}: Params) => {
  const { lastChainEvent, userChainState } =
    await getLastUserChainEventByMainDeviceSigningPublicKey({
      mainDeviceSigningPublicKey: mainDevice.signingPublicKey,
    });

  const event = userChain.removeDevice({
    authorKeyPair: {
      privateKey: mainDevice.signingPrivateKey,
      publicKey: mainDevice.signingPublicKey,
    },
    signingPublicKey: deviceSigningPublicKeyToBeDeleted,
    prevEvent: lastChainEvent,
  });
  const newUserChainState = userChain.applyEvent({
    state: userChainState,
    event,
    knownVersion: userChain.version,
  });

  const existingWorkspaceMemberDevicesProofs =
    await getWorkspaceMemberDevicesProofs({
      userId: userChainState.id,
      take: 100,
    });

  const workspaceMemberDevicesProofs = await Promise.all(
    existingWorkspaceMemberDevicesProofs.map(async (existingEntry) => {
      const { workspaceChainState } = await getLastWorkspaceChainEvent({
        workspaceId: existingEntry.workspaceId,
      });
      const workspaceMemberDevicesProofData: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData =
        {
          clock: existingEntry.proof.clock + 1,
          userChainHashes: {
            ...existingEntry.data.userChainHashes,
            [userChainState.id]: newUserChainState.eventHash,
          },
          workspaceChainHash: workspaceChainState.lastEventHash,
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
      return {
        workspaceId: existingEntry.workspaceId,
        serializedWorkspaceMemberDevicesProof: JSON.stringify(newProof),
      };
    })
  );

  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation deleteDevice($input: DeleteDeviceInput!) {
      deleteDevice(input: $input) {
        status
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        creatorSigningPublicKey,
        newDeviceWorkspaceKeyBoxes,
        serializedUserChainEvent: JSON.stringify(event),
        workspaceMemberDevicesProofs,
      },
    },
    authorizationHeaders
  );
  return result;
};
