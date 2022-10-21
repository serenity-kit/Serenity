import {
  AcceptWorkspaceInvitationDocument,
  AcceptWorkspaceInvitationMutation,
  AcceptWorkspaceInvitationMutationVariables,
  Workspace,
} from "../../generated/graphql";
import { getUrqlClient } from "../urqlClient/urqlClient";

export type Props = {
  workspaceInvitationId: string;
};

export const acceptWorkspaceInvitation = async ({
  workspaceInvitationId,
}: Props): Promise<Workspace | undefined> => {
  const result = await getUrqlClient()
    .mutation<
      AcceptWorkspaceInvitationMutation,
      AcceptWorkspaceInvitationMutationVariables
    >(
      AcceptWorkspaceInvitationDocument,
      {
        input: { workspaceInvitationId },
      },
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (result.data) {
    // TODO: put up a toast explaining the new workspace
    const workspace = result.data.acceptWorkspaceInvitation?.workspace;
    if (!workspace) {
      // NOTE: probably the invitation expired or was deleted
      throw new Error("Could not find workspace");
    }
    return workspace;
  }
};
