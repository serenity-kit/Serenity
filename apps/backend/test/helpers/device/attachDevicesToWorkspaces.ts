import { gql } from "graphql-request";
import { WorkspaceMemberDevices } from "../../../src/types/workspaceDevice";

type Params = {
  graphql: any;
  creatorDeviceSigningPublicKey: string;
  workspaceMemberDevices: WorkspaceMemberDevices[];
  authorizationHeader: string;
};

export const attachDevicesToWorkspaces = async ({
  graphql,
  creatorDeviceSigningPublicKey,
  workspaceMemberDevices,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation attachDevicesToWorkspaces(
      $input: AttachDevicesToWorkspacesInput!
    ) {
      attachDevicesToWorkspaces(input: $input) {
        workspaces {
          id
          workspaceKeys {
            id
            generation
            members {
              id
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
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        creatorDeviceSigningPublicKey,
        workspaceMemberDevices,
      },
    },
    authorizationHeaders
  );
  return result;
};
