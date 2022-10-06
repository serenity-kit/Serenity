import {
  MeWithWorkspaceLoadingInfoDocument,
  MeWithWorkspaceLoadingInfoQuery,
  MeWithWorkspaceLoadingInfoQueryVariables,
} from "../../generated/graphql";
import { getUrqlClient } from "../../utils/urqlClient/urqlClient";

export const fetchMeWithWorkspaceLoadingInfo = async (
  variables: MeWithWorkspaceLoadingInfoQueryVariables
) => {
  const result = await getUrqlClient()
    .query<
      MeWithWorkspaceLoadingInfoQuery,
      MeWithWorkspaceLoadingInfoQueryVariables
    >(MeWithWorkspaceLoadingInfoDocument, variables, {
      // better to be safe here and always refetch
      requestPolicy: "network-only",
    })
    .toPromise();
  return result;
};
