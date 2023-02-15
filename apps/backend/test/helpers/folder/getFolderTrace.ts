import { gql } from "graphql-request";

type Params = {
  graphql: any;
  folderId: string;
  authorizationHeader: string;
};

export const getFolderTrace = async ({
  graphql,
  folderId,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    query folderTrace($folderId: ID!) {
      folderTrace(folderId: $folderId) {
        id
        parentFolderId
        rootFolderId
        workspaceId
        encryptedName
        encryptedNameNonce
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
  `;
  const result = await graphql.client.request(
    query,
    { folderId },
    authorizationHeaders
  );
  return result;
};
