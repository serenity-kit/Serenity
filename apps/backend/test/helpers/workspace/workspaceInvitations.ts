import { gql } from "graphql-request";

type Params = {
  graphql: any;
  workspaceId: string;
  authorizationHeader: string;
};

export const workspaceInvitations = async ({
  graphql,
  workspaceId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    {
        workspaceInvitations(workspaceId: "${workspaceId}", first: 50) {
            edges {
                node {
                    id
                    workspaceId
                    inviterUserId
                    expiresAt
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
    `;
  const result = await graphql.client.request(
    query,
    null,
    authorizationHeaders
  );
  return result;
};
