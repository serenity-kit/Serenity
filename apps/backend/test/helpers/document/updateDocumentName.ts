import {
  createDocumentKey,
  encryptDocumentTitle,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import { buildFolderKeyTrace } from "../folder/buildFolderKeyTrace";

type Params = {
  graphql: any;
  id: string;
  name: string;
  folderKey: string;
  parentFolderId: string;
  workspaceKeyId: string;
  authorizationHeader: string;
};

export const updateDocumentName = async ({
  graphql,
  id,
  name,
  folderKey,
  parentFolderId,
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

  const nameKeyDerivationTrace = await buildFolderKeyTrace({
    workspaceKeyId,
    parentFolderId,
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
          nameKeyDerivationTrace {
            workspaceKeyId
            parentFolders {
              folderId
              subkeyId
              parentFolderId
            }
          }
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
        nameKeyDerivationTrace,
      },
    },
    authorizationHeaders
  );
  return result;
};
