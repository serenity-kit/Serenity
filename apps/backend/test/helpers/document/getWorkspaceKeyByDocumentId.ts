import { gql } from "graphql-request";

type Params = {
  graphql: any;
  documentId: string;
  deviceSigningPublicKey: string;
  authorizationHeader: string;
};

export const getWorkspaceKeyByDocumentId = async ({
  graphql,
  documentId,
  deviceSigningPublicKey,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    query workspaceKeyByDocumentId(
      $documentId: ID!
      $deviceSigningPublicKey: String!
    ) {
      workspaceKeyByDocumentId(
        documentId: $documentId
        deviceSigningPublicKey: $deviceSigningPublicKey
      ) {
        nameWorkspaceKey {
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
    }
  `;
  const result = await graphql.client.request(
    query,
    { documentId, deviceSigningPublicKey },
    authorizationHeaders
  );
  return result;
};
