import { gql } from "graphql-request";

type Params = {
  graphql: any;
  documentId: string;
  documentShareLinkToken?: string | null | undefined;
  deviceSigningPublicKey?: string | null | undefined;
  first: number;
  after?: string;
  authorizationHeader: string;
};

export const commentsByDocumentId = async ({
  graphql,
  documentId,
  documentShareLinkToken,
  deviceSigningPublicKey,
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
      $deviceSigningPublicKey: String
      $first: Int!
      $after: String
    ) {
      commentsByDocumentId(
        documentId: $documentId
        documentShareLinkToken: $documentShareLinkToken
        deviceSigningPublicKey: $deviceSigningPublicKey
        first: $first
        after: $after
      ) {
        edges {
          node {
            id
            documentId
            contentCiphertext
            contentNonce
            keyDerivationTrace {
              workspaceKeyId
              trace {
                entryId
                subkeyId
                context
                parentId
              }
            }
            creatorDevice {
              signingPublicKey
              encryptionPublicKey
              encryptionPublicKeySignature
              createdAt
            }
            workspaceKey {
              id
              workspaceId
              generation
              workspaceKeyBox {
                id
                workspaceKeyId
                deviceSigningPublicKey
                creatorDeviceSigningPublicKey
                nonce
                ciphertext
                creatorDevice {
                  signingPublicKey
                  encryptionPublicKey
                  encryptionPublicKeySignature
                  createdAt
                }
              }
            }
            commentReplies {
              id
              contentCiphertext
              contentNonce
              keyDerivationTrace {
                workspaceKeyId
                trace {
                  entryId
                  subkeyId
                  context
                  parentId
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
      deviceSigningPublicKey,
      first,
      after,
    },
    authorizationHeaders
  );
  return result;
};
