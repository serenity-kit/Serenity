import { gql } from "graphql-request";
import { WorkspaceWithWorkspaceDevicesParing } from "../../../src/types/workspaceDevice";

type Params = {
  graphql: any;
  creatorSigningPublicKey: string;
  newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[];
  deviceSigningPublicKeysToBeDeleted: string[];
  authorizationHeader: string;
};

export const deleteDevices = async ({
  graphql,
  creatorSigningPublicKey,
  newDeviceWorkspaceKeyBoxes,
  authorizationHeader,
  deviceSigningPublicKeysToBeDeleted,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation deleteDevices($input: DeleteDevicesInput!) {
      deleteDevices(input: $input) {
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
        deviceSigningPublicKeysToBeDeleted,
      },
    },
    authorizationHeaders
  );
  return result;
};
