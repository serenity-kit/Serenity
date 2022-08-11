import { gql } from "graphql-request";
import { AttachToDeviceWorkspaceKeyBoxData } from "../../../src/database/device/attachDeviceToWorkspaces";

type Params = {
  graphql: any;
  deviceSigningPublicKey: string;
  creatorDeviceSigningPublicKey: string;
  workspaceKeyBoxes: AttachToDeviceWorkspaceKeyBoxData[];
  authorizationHeader: string;
};

export const attachDeviceToWorkspaces = async ({
  graphql,
  deviceSigningPublicKey,
  creatorDeviceSigningPublicKey,
  workspaceKeyBoxes,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation attachDeviceToWorkspaces($input: AttachDeviceToWorkspacesInput!) {
      attachDeviceToWorkspaces(input: $input) {
        workspaceKeys {
          nodes {
            id
          }
        }
      }
    }
  `;

  // workspaceKeys {
  //   id
  //   generation
  //   workspaceKeyBox {
  //     id
  //     creatorDeviceSigningPublicKey
  //     receiverDeviceSigningPublicKey
  //     ciphertext
  //     nonce
  //   }
  // }
  const result = await graphql.client.request(
    query,
    {
      input: {
        creatorDeviceSigningPublicKey,
        receiverDeviceSigningPublicKey: deviceSigningPublicKey,
        workspaceKeyBoxes,
      },
    },
    authorizationHeaders
  );
  return result;
};
