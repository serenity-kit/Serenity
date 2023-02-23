import {
  createDocumentKey,
  encryptDocumentTitle,
} from "@serenity-tools/common";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  name: string;
  snapshotKey: string;
  parentFolderId: string;
  workspaceKeyId: string;
  authorizationHeader: string;
};

export const updateDocumentName = async ({
  graphql,
  id,
  name,
  snapshotKey,
  parentFolderId,
  workspaceKeyId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const documentKeyData = createDocumentKey({
    snapshotKey,
  });
  const encryptedDocumentResult = encryptDocumentTitle({
    title: name,
    key: documentKeyData.key,
  });

  const query = gql`
    mutation updateDocumentName($input: UpdateDocumentNameInput!) {
      updateDocumentName(input: $input) {
        document {
          encryptedName
          encryptedNameNonce
          id
          parentFolderId
          workspaceId
          subkeyId
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        id,
        encryptedName: encryptedDocumentResult.ciphertext,
        encryptedNameNonce: encryptedDocumentResult.publicNonce,
        workspaceKeyId,
        subkeyId: documentKeyData.subkeyId,
      },
    },
    authorizationHeaders
  );
  return result;
};
