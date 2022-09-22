import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";

export type Props = {
  graphql: TestContext;
  workspaceId: string;
  sessionKey: string;
};
export const getIsWorkspaceAuthorized = async ({
  graphql,
  workspaceId,
  sessionKey,
}: Props) => {
  const authorizationHeader = { authorization: sessionKey };
  const query = gql`
    query isWorkspaceAuthorized($workspaceId: ID!) {
      isWorkspaceAuthorized(workspaceId: $workspaceId) {
        isAuthorized
      }
    }
  `;
  return await graphql.client.request(
    query,
    { workspaceId },
    authorizationHeader
  );
};
