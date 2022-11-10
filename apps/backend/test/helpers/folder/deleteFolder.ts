import { gql } from "graphql-request";

type Params = {
  graphql: any;
  ids: string[];
  workspaceId: string;
  authorizationHeader: string;
};

export const deleteFolders = async ({
  graphql,
  ids,
  workspaceId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation deleteFolders($input: DeleteFoldersInput!) {
      deleteFolders(input: $input) {
        status
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { input: { ids, workspaceId } },
    authorizationHeaders
  );
  return result;
};
