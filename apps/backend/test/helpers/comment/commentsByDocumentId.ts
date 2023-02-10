import { gql } from "graphql-request";

type Params = {
  graphql: any;
  documentId: string;
  documentShareLinkToken?: string | null | undefined;
  first: number;
  after?: string;
  authorizationHeader: string;
};

export const commentsByDocumentId = async ({
  graphql,
  documentId,
  documentShareLinkToken,
  first,
  after,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    query commentsByDocumentId(
      $documentId: ID!
      $documentShareLinkToken: String
      $first: Int!
      $after: String
    ) {
      commentsByDocumentId(
        documentId: $documentId
        documentShareLinkToken: $documentShareLinkToken
        first: $first
        after: $after
      ) {
        edges {
          node {
            id
            documentId
            encryptedContent
            encryptedContentNonce
            contentKeyDerivationTrace {
              workspaceKeyId
              subkeyId
              parentFolders {
                folderId
                subkeyId
                parentFolderId
              }
            }
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
              encryptionPublicKeySignature
              createdAt
            }
            commentReplies {
              id
              encryptedContent
              encryptedContentNonce
              contentKeyDerivationTrace {
                workspaceKeyId
                subkeyId
                parentFolders {
                  folderId
                  subkeyId
                  parentFolderId
                }
              }
            }
          }
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
    {
      documentId,
      documentShareLinkToken,
      first,
      after,
    },
    authorizationHeaders
  );
  return result;
};
