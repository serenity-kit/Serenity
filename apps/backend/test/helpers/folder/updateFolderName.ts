import { encryptFolder } from "@serenity-tools/common";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  name: string;
  workspaceKey: string;
  authorizationHeader: string;
};

export const updateFolderName = async ({
  graphql,
  id,
  name,
  workspaceKey,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const encryptedFolderResult = await encryptFolder({
    name,
    parentKey: workspaceKey,
  });
  const query = gql`
    mutation updateFolderName($input: UpdateFolderNameInput!) {
      updateFolderName(input: $input) {
        folder {
          name
          id
          encryptedName
          encryptedNameNonce
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
        name,
        encryptedName: encryptedFolderResult.ciphertext,
        encryptedNameNonce: encryptedFolderResult.publicNonce,
        subkeyId: encryptedFolderResult.folderSubkeyId,
      },
    },
    authorizationHeaders
  );
  return result;
};
