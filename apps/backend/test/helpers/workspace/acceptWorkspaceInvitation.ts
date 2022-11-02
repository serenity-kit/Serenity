import { gql } from "graphql-request";

type Params = {
  graphql: any;
  workspaceInvitationId: string;
  authorizationHeader: string;
};

export const acceptWorkspaceInvitation = async ({
  graphql,
  workspaceInvitationId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation {
      acceptWorkspaceInvitation(
        input: {
          workspaceInvitationId: "${workspaceInvitationId}"
        }
      ) {
        workspace {
          id
          name
          members {
            userId
            username
            role
          }
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
