import { gql } from "graphql-request";

type Params = {
  graphql: any;
  ids: string[];
  workspaceId: string;
  authorizationHeader: string;
};

export const deleteDocuments = async ({
  graphql,
  ids,
  workspaceId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation deleteDocuments($input: DeleteDocumentsInput!) {
      deleteDocuments(input: $input) {
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
