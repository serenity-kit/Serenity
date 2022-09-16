import { Client } from "urql";
import {
  IsWorkspaceAuthorizedDocument,
  IsWorkspaceAuthorizedQuery,
  IsWorkspaceAuthorizedQueryVariables,
} from "../../generated/graphql";

export type Props = {
  urqlClient: Client;
  workspaceId: string;
};
export const isWorkspaceAuthorized = async ({
  urqlClient,
  workspaceId,
}: Props) => {
  const isAuthorizedResult = await urqlClient
    .query<IsWorkspaceAuthorizedQuery, IsWorkspaceAuthorizedQueryVariables>(
      IsWorkspaceAuthorizedDocument,
      { workspaceId },
      {
        requestPolicy: "network-only",
      }
    )
    .toPromise();

  if (isAuthorizedResult.error) {
    console.error(isAuthorizedResult.error);
    // throw new Error(isAuthorizedResult.error.message);
  }
  const isAuthorized =
    isAuthorizedResult.data?.isWorkspaceAuthorized?.isAuthorized || false;
  return isAuthorized;
};
