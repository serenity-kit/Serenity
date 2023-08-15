import { gql } from "graphql-request";
import { WorkspaceDeviceParing } from "../../../src/types/workspaceDevice";

type Params = {
  graphql: any;
  workspaceId: string;
  creatorDeviceSigningPublicKey: string;
  deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[];
  authorizationHeader: string;
  serializedWorkspaceChainEvent: string;
};

export const removeMemberAndRotateWorkspaceKey = async ({
  graphql,
  workspaceId,
  creatorDeviceSigningPublicKey,
  deviceWorkspaceKeyBoxes,
  authorizationHeader,
  serializedWorkspaceChainEvent,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
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
        serializedWorkspaceChainEvent,
      },
    },
    authorizationHeaders
  );
  return result;
};
