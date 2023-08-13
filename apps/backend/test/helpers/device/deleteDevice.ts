import * as userChain from "@serenity-kit/user-chain";
import { LocalDevice } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { WorkspaceWithWorkspaceDevicesParing } from "../../../src/types/workspaceDevice";
import { getLastUserChainEventByMainDeviceSigningPublicKey } from "../userChain/getLastUserChainEventByMainDeviceSigningPublicKey";

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
  const { lastChainEvent } =
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
      },
    },
    authorizationHeaders
  );
  return result;
};
