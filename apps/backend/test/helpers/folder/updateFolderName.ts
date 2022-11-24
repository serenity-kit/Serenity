import { encryptFolderName } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { buildFolderKeyTrace } from "./buildFolderKeyTrace";

type Params = {
  graphql: any;
  id: string;
  name: string;
  workspaceKey: string;
  workspaceKeyId: string;
  parentFolderId: string | null | undefined;
  authorizationHeader: string;
};

export const updateFolderName = async ({
  graphql,
  id,
  name,
  workspaceKey,
  workspaceKeyId,
  parentFolderId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const encryptedFolderResult = await encryptFolderName({
    name,
    parentKey: workspaceKey,
  });

  const keyDerivationTrace = await buildFolderKeyTrace({
    workspaceKeyId,
    subkeyId: encryptedFolderResult.folderSubkeyId,
    parentFolderId,
  });
  const query = gql`
    mutation updateFolderName($input: UpdateFolderNameInput!) {
      updateFolderName(input: $input) {
        folder {
          id
          encryptedName
          encryptedNameNonce
          parentFolderId
          rootFolderId
          workspaceId
          keyDerivationTrace {
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
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        id,
        encryptedName: encryptedFolderResult.ciphertext,
        encryptedNameNonce: encryptedFolderResult.publicNonce,
        workspaceKeyId,
        subkeyId: encryptedFolderResult.folderSubkeyId,
        keyDerivationTrace,
      },
    },
    authorizationHeaders
  );
  return result;
};
