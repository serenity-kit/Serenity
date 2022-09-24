import { encryptFolderName } from "@serenity-tools/common";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  name: string;
  workspaceKey: string;
  workspaceKeyId: string;
  authorizationHeader: string;
};

export const updateFolderName = async ({
  graphql,
  id,
  name,
  workspaceKey,
  workspaceKeyId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const encryptedFolderResult = await encryptFolderName({
    name,
    parentKey: workspaceKey,
  });
  const query = gql`
    mutation updateFolderName($input: UpdateFolderNameInput!) {
      updateFolderName(input: $input) {
        folder {
          id
          encryptedName
          encryptedNameNonce
          workspaceKeyId
          subkeyId
          parentFolderId
          rootFolderId
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
        encryptedName: encryptedFolderResult.ciphertext,
        encryptedNameNonce: encryptedFolderResult.publicNonce,
        workspaceKeyId,
        subkeyId: encryptedFolderResult.folderSubkeyId,
      },
    },
    authorizationHeaders
  );
  return result;
};
