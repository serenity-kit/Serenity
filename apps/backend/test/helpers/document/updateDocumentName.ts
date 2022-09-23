import {
  createDocumentKey,
  encryptDocumentTitle,
} from "@serenity-tools/common";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  name: string;
  folderKey: string;
  workspaceKeyId: string;
  authorizationHeader: string;
};

export const updateDocumentName = async ({
  graphql,
  id,
  name,
  folderKey,
  workspaceKeyId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const documentSubkey = await createDocumentKey({
    folderKey,
  });
  const encryptedDocumentResult = await encryptDocumentTitle({
    title: name,
    key: documentSubkey.key,
  });
  const query = gql`
    mutation updateDocumentName($input: UpdateDocumentNameInput!) {
      updateDocumentName(input: $input) {
        document {
          encryptedName
          encryptedNameNonce
          workspaceKeyId
          subkeyId
          id
          parentFolderId
          workspaceId
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
        subkeyId: documentSubkey.subkeyId,
      },
    },
    authorizationHeaders
  );
  return result;
};
