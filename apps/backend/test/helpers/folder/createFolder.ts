import { encryptFolderName } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";
import { buildFolderKeyTrace } from "./buildFolderKeyTrace";

type Params = {
  graphql: TestContext;
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
  const encryptedFolderResult = encryptFolderName({
    name,
    parentKey,
  });
  const subkeyId = encryptedFolderResult.folderSubkeyId;
  const encryptedName = encryptedFolderResult.ciphertext;
  const encryptedNameNonce = encryptedFolderResult.publicNonce;

  const keyDerivationTrace = await buildFolderKeyTrace({
    workspaceKeyId,
    subkeyId,
    parentFolderId,
  });

  const query = gql`
    mutation createFolder($input: CreateFolderInput!) {
      createFolder(input: $input) {
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
        encryptedName,
        encryptedNameNonce,
        parentFolderId,
        workspaceKeyId,
        subkeyId,
        workspaceId,
        keyDerivationTrace,
      },
    },
    authorizationHeaders
  );
  return result;
};
