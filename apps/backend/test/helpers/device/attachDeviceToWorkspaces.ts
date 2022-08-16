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
    mutation attachDeviceToWorkspaces($input: AttachDeviceToWorkspaceInput!) {
      attachDeviceToWorkspaces(input: $input) {
        workspaceKey {
          id
          workspaceId
          generation
          workspaceKeyBox {
            id
            deviceSigningPublicKey
            ciphertext
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
        receiverDeviceSigningPublicKey: deviceSigningPublicKey,
        workspaceKeyBoxes,
      },
    },
    authorizationHeaders
  );
  return result;
};
