import { encryptFolderName } from "@serenity-tools/common";
import { gql } from "graphql-request";

type Params = {
  graphql: any;
  id: string;
  name: string;
  parentFolderId: string | null | undefined;
  workspaceId: string;
  workspaceKeyId: string;
  parentKey: string;
  authorizationHeader: string;
};

export const createFolder = async ({
  graphql,
  id,
  name,
  parentKey,
  workspaceKeyId,
  parentFolderId,
  workspaceId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const encryptedFolderResult = await encryptFolderName({
    name,
    parentKey,
  });
  const subkeyId = encryptedFolderResult.folderSubkeyId;
  const encryptedName = encryptedFolderResult.ciphertext;
  const encryptedNameNonce = encryptedFolderResult.publicNonce;

  const query = gql`
    mutation createFolder($input: CreateFolderInput!) {
      createFolder(input: $input) {
        folder {
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
        encryptedName,
        encryptedNameNonce,
        parentFolderId,
        workspaceKeyId: workspaceKeyId,
        subkeyId,
        workspaceId,
      },
    },
    authorizationHeaders
  );
  return result;
};
