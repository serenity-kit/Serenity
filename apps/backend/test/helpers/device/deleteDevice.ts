import { gql } from "graphql-request";
import { WorkspaceWithWorkspaceDevicesParing } from "../../../src/types/workspaceDevice";

type Params = {
  graphql: any;
  creatorSigningPublicKey: string;
  newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[];
  deviceSigningPublicKeyToBeDeleted: string;
  authorizationHeader: string;
};

export const deleteDevice = async ({
  graphql,
  creatorSigningPublicKey,
  newDeviceWorkspaceKeyBoxes,
  authorizationHeader,
  deviceSigningPublicKeyToBeDeleted,
}: Params) => {
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
        deviceSigningPublicKeyToBeDeleted,
      },
    },
    authorizationHeaders
  );
  return result;
};
