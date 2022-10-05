import {
  PendingWorkspaceInvitationDocument,
  PendingWorkspaceInvitationQuery,
  PendingWorkspaceInvitationQueryVariables,
} from "../../generated/graphql";
import { getUrqlClient } from "../urqlClient/urqlClient";

export type Props = {};
export const getPendingWorkspaceInvitationId = async ({}: Props): Promise<
  string | undefined | null
> => {
  const pendingWorkspaceInvitationResult = await getUrqlClient()
    .query<
      PendingWorkspaceInvitationQuery,
      PendingWorkspaceInvitationQueryVariables
    >(
      PendingWorkspaceInvitationDocument,
      {},
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  const pendingWorkspaceInvitationId =
    pendingWorkspaceInvitationResult.data?.pendingWorkspaceInvitation?.id;
  return pendingWorkspaceInvitationId;
};
