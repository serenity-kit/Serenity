import {
  Workspace,
  WorkspacesDocument,
  WorkspacesQuery,
  WorkspacesQueryVariables,
} from "../../generated/graphql";
import { getUrqlClient } from "../urqlClient/urqlClient";

export type Props = {
  deviceSigningPublicKey: string;
};
export const getWorkspaces = async ({
  deviceSigningPublicKey,
}: Props): Promise<Workspace[] | null> => {
  const workspacesResult = await getUrqlClient()
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
