import { Client } from "urql";
import {
  Workspace,
  WorkspacesDocument,
  WorkspacesQuery,
  WorkspacesQueryVariables,
} from "../../generated/graphql";

export type Props = {
  urqlClient: Client;
  deviceSigningPublicKey: string;
};
export const getWorkspaces = async ({
  urqlClient,
  deviceSigningPublicKey,
}: Props): Promise<Workspace[] | null> => {
  const workspacesResult = await urqlClient
    .query<WorkspacesQuery, WorkspacesQueryVariables>(
      WorkspacesDocument,
      {
        deviceSigningPublicKey,
      },
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
