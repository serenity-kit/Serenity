import { gql } from "graphql-request";
import { WorkspaceWithWorkspaceDevicesParing } from "../../../src/types/workspaceDevice";

type Params = {
  graphql: any;
  creatorSigningPublicKey: string;
  newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[];
  authorizationHeader: string;
};

export const authorizeDevices = async ({
  graphql,
  creatorSigningPublicKey,
  newDeviceWorkspaceKeyBoxes,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation authorizeDevices($input: AuthorizeDevicesInput!) {
      authorizeDevices(input: $input) {
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
      },
    },
    authorizationHeaders
  );
  return result;
};
