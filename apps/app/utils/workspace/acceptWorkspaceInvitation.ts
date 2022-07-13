import { Workspace } from "../../generated/graphql";

export type Props = {
  workspaceInvitationId: string;
  acceptWorkspaceInvitationMutation: any;
};
export const acceptWorkspaceInvitation = async ({
  workspaceInvitationId,
  acceptWorkspaceInvitationMutation,
}: Props): Promise<Workspace | undefined> => {
  const result = await acceptWorkspaceInvitationMutation({
    input: { workspaceInvitationId },
  });
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
