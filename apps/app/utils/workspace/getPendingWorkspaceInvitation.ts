import { runPendingWorkspaceInvitationQuery } from "../../generated/graphql";

export type Props = {};
export const getPendingWorkspaceInvitation = async ({}: Props) => {
  const pendingWorkspaceInvitationResult =
    await runPendingWorkspaceInvitationQuery(
      {},
      { requestPolicy: "network-only" }
    );
  const pendingWorkspaceInvitation =
    pendingWorkspaceInvitationResult.data?.pendingWorkspaceInvitation;
  if (
    !pendingWorkspaceInvitation?.id ||
    !pendingWorkspaceInvitation?.ciphertext ||
    !pendingWorkspaceInvitation?.publicNonce ||
    !pendingWorkspaceInvitation?.subkeyId
  ) {
    return null;
  }
  return pendingWorkspaceInvitation;
};
