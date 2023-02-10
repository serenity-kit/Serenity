import { gql } from "graphql-request";

type Params = {
  graphql: any;
  documentId: string;
  authorizationHeader: string;
};

export const getWorkspaceKeyByDocumentId = async ({
  graphql,
  documentId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    query workspaceKeyByDocumentId($documentId: ID!) {
      workspaceKeyByDocumentId(documentId: $documentId) {
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
    }
  `;
  const result = await graphql.client.request(
    query,
    { documentId },
    authorizationHeaders
  );
  return result;
};
