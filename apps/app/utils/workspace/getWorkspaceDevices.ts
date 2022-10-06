import {
  WorkspaceDevicesDocument,
  WorkspaceDevicesQuery,
  WorkspaceDevicesQueryVariables,
} from "../../generated/graphql";
import { getUrqlClient } from "../urqlClient/urqlClient";

export type Props = {
  workspaceId: string;
};
export const getWorkspaceDevices = async ({ workspaceId }: Props) => {
  const result = await getUrqlClient()
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
