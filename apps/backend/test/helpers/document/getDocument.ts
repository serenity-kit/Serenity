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
    query document($id: ID!) {
      document(id: $id) {
        id
        nameCiphertext
        nameNonce
        parentFolderId
        workspaceId
        subkeyId
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { id },
    authorizationHeaders
  );
  return result;
};
