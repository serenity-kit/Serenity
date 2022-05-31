import { gql } from "graphql-request";

type Params = {
  graphql: any;
  workspaceId: string;
  authorizationHeader: string;
};

export const createWorkspaceInvitation = async ({
  graphql,
  workspaceId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation {
      createWorkspaceInvitation(
        input: {
          workspaceId: "${workspaceId}"
        }
      ) {
        workspaceInvitation {
          id
          workspaceId
          inviterUserId
          expiresAt
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
