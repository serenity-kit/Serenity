import {
  PendingWorkspaceInvitationQuery,
  PendingWorkspaceInvitationQueryVariables,
  PendingWorkspaceInvitationDocument,
} from "../../generated/graphql";
import { Client } from "urql";

export type Props = {
  urqlClient: Client;
};
export const getPendingWorkspaceInvitationId = async ({
  urqlClient,
}: Props): Promise<string | undefined | null> => {
  const pendingWorkspaceInvitationResult = await urqlClient
    .query<
      PendingWorkspaceInvitationQuery,
      PendingWorkspaceInvitationQueryVariables
    >(PendingWorkspaceInvitationDocument, undefined, {
      // better to be safe here and always refetch
      requestPolicy: "network-only",
    })
    .toPromise();
  const pendingWorkspaceInvitationId =
    pendingWorkspaceInvitationResult.data?.pendingWorkspaceInvitation?.id;
  return pendingWorkspaceInvitationId;
};
