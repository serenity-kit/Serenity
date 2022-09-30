import { Client } from "urql";
import {
  Workspace,
  WorkspaceDocument,
  WorkspaceQuery,
  WorkspaceQueryVariables,
} from "../../generated/graphql";
import { setWorskpaceKeysForWorkspace } from "../workspaceKey/workspaceKeyStore";

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
  const workspace = workspaceResult.data?.workspace;
  if (workspace) {
    await setWorskpaceKeysForWorkspace(workspace.id, workspace.workspaceKeys!);
    return workspace as Workspace;
  } else {
    return null;
  }
};
