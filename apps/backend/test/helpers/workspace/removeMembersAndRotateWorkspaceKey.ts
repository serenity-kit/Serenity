import { gql } from "graphql-request";
import { WorkspaceDeviceParing } from "../../../src/types/workspaceDevice";

type Params = {
  graphql: any;
  workspaceId: string;
  revokedUserIds: string[];
  creatorDeviceSigningPublicKey: string;
  deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[];
  authorizationHeader: string;
};

export const removeMembersAndRotateWorkspaceKey = async ({
  graphql,
  workspaceId,
  revokedUserIds,
  creatorDeviceSigningPublicKey,
  deviceWorkspaceKeyBoxes,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation removeMembersAndRotateWorkspaceKey(
      $input: RemoveMembersAndRotateWorkspaceKeyInput!
    ) {
      removeMembersAndRotateWorkspaceKey(input: $input) {
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
        revokedUserIds,
        workspaceId,
        deviceWorkspaceKeyBoxes,
      },
    },
    authorizationHeaders
  );
  return result;
};
