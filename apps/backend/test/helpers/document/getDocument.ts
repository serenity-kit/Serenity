import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  authorizationHeader: string;
};

export const getDocument = async ({
  graphql,
  id,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    {
      document(id: "${id}") {
        document {
            id
            name
            workspaceId
            parentFolderId
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
