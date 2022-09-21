import { Client } from "urql";
import {
  UnauthorizedMembersDocument,
  UnauthorizedMembersQuery,
  UnauthorizedMembersQueryVariables,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { authorizeNewDevices } from "../workspaceDevice/authorizeNewDevices";
import { getWorkspaces } from "./getWorkspaces";

export const secondsBetweenNewMemberChecks = 5;

export type Props = { urqlClient: Client; activeDevice: Device };

export const addNewMembersIfNecessary = async ({
  urqlClient,
  activeDevice,
}: Props) => {
  // TODO: fetch all user workspaces
  const deviceSigningPublicKey = activeDevice.signingPublicKey;
  const workspaces = await getWorkspaces({
    urqlClient,
    deviceSigningPublicKey,
  });
  if (!workspaces) {
    // nothing to do
    return;
  }
  const workspaceIds: string[] = [];
  workspaces.forEach((workspace) => {
    workspaceIds.push(workspace.id);
  });
  const unauthorizedMembersResult = await urqlClient
    .query<UnauthorizedMembersQuery, UnauthorizedMembersQueryVariables>(
      UnauthorizedMembersDocument,
      { workspaceIds },
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  const userIds = unauthorizedMembersResult.data?.unauthorizedMembers?.userIds;
  if (userIds && userIds.length > 0) {
    await authorizeNewDevices({ urqlClient, activeDevice });
  }
};
