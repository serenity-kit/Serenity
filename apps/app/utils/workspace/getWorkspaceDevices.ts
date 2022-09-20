import { Client } from "urql";
import {
  WorkspaceDevicesDocument,
  WorkspaceDevicesQuery,
  WorkspaceDevicesQueryVariables,
} from "../../generated/graphql";

export type Props = {
  urqlClient: Client;
  workspaceId: string;
};
export const getWorkspaceDevices = async ({
  urqlClient,
  workspaceId,
}: Props) => {
  const result = await urqlClient
    .query<WorkspaceDevicesQuery, WorkspaceDevicesQueryVariables>(
      WorkspaceDevicesDocument,
      {
        workspaceId,
      },
      {
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  const workspaceDevices = result.data?.workspaceDevices?.nodes;
  return workspaceDevices;
};
