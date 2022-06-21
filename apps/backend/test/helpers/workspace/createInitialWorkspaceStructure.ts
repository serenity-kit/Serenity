import { gql } from "graphql-request";

type Params = {
  graphql: any;
  workspaceId: string;
  workspaceName: string;
  authorizationHeader: string;
};

export const createInitialWorkspaceStructure = async ({
  graphql,
  workspaceName,
  workspaceId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation {
        createInitialWorkspaceStructure(
        input: {
          workspaceName: "${workspaceName}"
          workspaceId: "${workspaceId}"
        }
      ) {
        workspace {
          id
          name
          members {
            userId
            isAdmin
          }
        }
        folder {
          id
          name
          parentFolderId
          rootFolderId
          workspaceId
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
