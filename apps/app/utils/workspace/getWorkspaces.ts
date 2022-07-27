import { Client } from "urql";
import {
  Workspace,
  WorkspacesDocument,
  WorkspacesQuery,
  WorkspacesQueryVariables,
} from "../../generated/graphql";

export type Props = {
  urqlClient: Client;
};
export const getWorkspaces = async ({
  urqlClient,
}: Props): Promise<Workspace[] | null> => {
  // check if the user has access to this workspace
  const workspacesResult = await urqlClient
    .query<WorkspacesQuery, WorkspacesQueryVariables>(
      WorkspacesDocument,
      undefined,
      { requestPolicy: "network-only" }
    )
    .toPromise();
  if (workspacesResult.error) {
    throw new Error(workspacesResult.error.message);
  }
  if (workspacesResult.data?.workspaces?.nodes) {
    return workspacesResult.data?.workspaces?.nodes as Workspace[];
  } else {
    return null;
  }
};
