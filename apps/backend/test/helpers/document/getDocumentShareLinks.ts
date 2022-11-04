import { gql } from "graphql-request";

type Params = {
  graphql: any;
  documentId: string;
  authorizationHeader: string;
};

export const getDocumentShareLinks = async ({
  graphql,
  documentId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    query documentShareLinks($documentId: ID!, $first: Int! = 50) {
      documentShareLinks(documentId: $documentId, first: $first) {
        nodes {
          token
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { documentId },
    authorizationHeaders
  );
  return result;
};
