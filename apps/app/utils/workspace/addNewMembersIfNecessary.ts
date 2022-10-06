import {
  UnauthorizedMembersDocument,
  UnauthorizedMembersQuery,
  UnauthorizedMembersQueryVariables,
} from "../../generated/graphql";
import { Device } from "../../types/Device";
import { getUrqlClient } from "../urqlClient/urqlClient";
import { authorizeNewDevices } from "../workspaceDevice/authorizeNewDevices";
import { getWorkspaces } from "./getWorkspaces";

export const secondsBetweenNewMemberChecks = 5;

export type Props = { activeDevice: Device };

export const addNewMembersIfNecessary = async ({ activeDevice }: Props) => {
  // TODO: fetch all user workspaces
  const deviceSigningPublicKey = activeDevice.signingPublicKey;
  const workspaces = await getWorkspaces({
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
  const unauthorizedMembersResult = await getUrqlClient()
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
    await authorizeNewDevices({ activeDevice });
  }
};
