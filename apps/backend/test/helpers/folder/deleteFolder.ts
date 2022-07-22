import { gql } from "graphql-request";

type Params = {
  graphql: any;
  ids: string[];
  authorizationHeader: string;
};

export const deleteFolders = async ({
  graphql,
  ids,
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
    { input: { ids } },
    authorizationHeaders
  );
  return result;
};
