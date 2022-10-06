import {
  UnauthorizedDevicesForWorkspacesDocument,
  UnauthorizedDevicesForWorkspacesQuery,
  UnauthorizedDevicesForWorkspacesQueryVariables,
} from "../../generated/graphql";
import { getUrqlClient } from "../urqlClient/urqlClient";

export type Props = {};
export const getUnauthorizedWorkspaceDevices = async ({}: Props) => {
  const unauthorizedDevicesResult = await getUrqlClient()
    .query<
      UnauthorizedDevicesForWorkspacesQuery,
      UnauthorizedDevicesForWorkspacesQueryVariables
    >(
      UnauthorizedDevicesForWorkspacesDocument,
      {},
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  const workspaces =
    unauthorizedDevicesResult.data?.unauthorizedDevicesForWorkspaces
      ?.unauthorizedMemberDevices;
  return workspaces;
};
