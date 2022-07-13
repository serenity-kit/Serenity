import { gql } from "graphql-request";

type Params = {
  graphql: any;
  workspaceId: string;
  authorizationHeader: string;
  first?: number;
};

export const workspaceInvitations = async ({
  graphql,
  workspaceId,
  authorizationHeader,
  first = 50,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    {
        workspaceInvitations(workspaceId: "${workspaceId}", first: ${first}) {
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
