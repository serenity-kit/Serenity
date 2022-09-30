import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  name: string | undefined;
  authorizationHeader: string;
};

export const updateWorkspaceName = async ({
  graphql,
  id,
  name,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };

  const query = gql`
    mutation updateWorkspaceName($input: UpdateWorkspaceNameInput!) {
      updateWorkspaceName(input: $input) {
        workspace {
          id
          name
          members {
            userId
            isAdmin
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { input: { id, name } },
    authorizationHeaders
  );
  return result;
};
