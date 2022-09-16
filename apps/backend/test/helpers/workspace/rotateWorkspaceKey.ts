import { gql } from "graphql-request";
import { WorkspaceDeviceParing } from "../../../src/types/workspaceDevice";

type Params = {
  graphql: any;
  workspaceId: string;
  creatorDeviceSigningPublicKey: string;
  deviceWorkspaceKeyBoxes: WorkspaceDeviceParing[];
  authorizationHeader: string;
};

export const rotateWorkspaceKey = async ({
  graphql,
  workspaceId,
  creatorDeviceSigningPublicKey,
  deviceWorkspaceKeyBoxes,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation rotateWorkspaceKey($input: RotateWorkspaceKeyInput!) {
      rotateWorkspaceKey(input: $input) {
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
      },
    },
    authorizationHeaders
  );
  return result;
};
