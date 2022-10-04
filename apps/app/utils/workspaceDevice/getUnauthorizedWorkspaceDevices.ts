import { Client } from "urql";
import {
  UnauthorizedDevicesForWorkspacesDocument,
  UnauthorizedDevicesForWorkspacesQuery,
  UnauthorizedDevicesForWorkspacesQueryVariables,
} from "../../generated/graphql";
import { urqlRef } from "../urqlClient/urqlClient";

export type Props = {
  urqlClient: Client;
};
export const getUnauthorizedWorkspaceDevices = async ({
  urqlClient,
}: Props) => {
  const unauthorizedDevicesResult = await urqlRef.urqlClient
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
