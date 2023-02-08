import { gql } from "graphql-request";

type Params = {
  graphql: any;
  documentId: string;
  first: number;
  authorizationHeader: string;
};

export const commentsByDocumentId = async ({
  graphql,
  documentId,
  first,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    query commentsByDocumentId($documentId: ID!, $first: Int) {
      commentsByDocumentId(documentId: $documentId, first: $first) {
        edges {
          node {
            id
            documentId
            encryptedContent
            encryptedContentNonce
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
              encryptionPublicKeySignature
              createdAt
            }
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      documentId,
      first,
    },
    authorizationHeaders
  );
  return result;
};
