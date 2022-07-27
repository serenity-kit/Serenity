import { Client } from "urql";
import {
  Workspace,
  WorkspaceDocument,
  WorkspaceQuery,
  WorkspaceQueryVariables,
} from "../../generated/graphql";

export type Props = {
  urqlClient: Client;
  workspaceId?: string;
  deviceSigningPublicKey: string;
};
export const getWorkspace = async ({
  workspaceId,
  urqlClient,
  deviceSigningPublicKey,
}: Props): Promise<Workspace | null> => {
  // check if the user has access to this workspace
  const workspaceResult = await urqlClient
    .query<WorkspaceQuery, WorkspaceQueryVariables>(
      WorkspaceDocument,
      {
        id: workspaceId,
        deviceSigningPublicKey,
      },
      { requestPolicy: "network-only" }
    )
    .toPromise();
  if (workspaceResult.error) {
    throw new Error(workspaceResult.error?.message);
  }
  if (workspaceResult.data?.workspace) {
    return workspaceResult.data?.workspace as Workspace;
  } else {
    return null;
  }
};
