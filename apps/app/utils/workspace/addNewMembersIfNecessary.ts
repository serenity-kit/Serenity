import { Client } from "urql";
import {
  UnauthorizedMembersDocument,
  UnauthorizedMembersQuery,
  UnauthorizedMembersQueryVariables,
} from "../../generated/graphql";
import { getActiveDevice } from "../device/getActiveDevice";
import { authorizeNewDevices } from "../workspaceDevice/authorizeNewDevices";
import { getWorkspaces } from "./getWorkspaces";

export const secondsBetweenNewMemberChecks = 5;

export type Props = { urqlClient: Client };
export const addNewMembersIfNecessary = async ({ urqlClient }: Props) => {
  // TODO: fetch all user workspaces
  const activeDevice = await getActiveDevice();
  if (!activeDevice) {
    // TODO: deal with this in the UI
    throw new Error("No active device found");
  }
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
    await authorizeNewDevices({ urqlClient });
  }
};
