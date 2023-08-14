import { gql } from "graphql-request";

type Params = {
  graphql: any;
  workspaceId: string;
  authorizationHeader: string;
  serializedWorkspaceChainEvent: string;
};

export const updateWorkspaceMemberRole = async ({
  graphql,
  workspaceId,
  serializedWorkspaceChainEvent,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  const query = gql`
    mutation updateWorkspaceMemberRole(
      $input: UpdateWorkspaceMemberRoleInput!
    ) {
      updateWorkspaceMemberRole(input: $input) {
        workspace {
          id
          name
          members {
            userId
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { input: { workspaceId, serializedWorkspaceChainEvent } },
    authorizationHeaders
  );
  return result;
};
