import {
  Workspace,
  WorkspaceDocument,
  WorkspaceQuery,
  WorkspaceQueryVariables,
} from "../../generated/graphql";
import { getUrqlClient } from "../urqlClient/urqlClient";

export type Props = {
  workspaceId?: string;
  deviceSigningPublicKey: string;
};
export const getWorkspace = async ({
  workspaceId,
  deviceSigningPublicKey,
}: Props): Promise<Workspace | null> => {
  const workspaceResult = await getUrqlClient()
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
