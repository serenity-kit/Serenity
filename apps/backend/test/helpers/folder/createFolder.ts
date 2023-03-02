import {
  encryptFolderName,
  folderDerivedKeyContext,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import { TestContext } from "../setupGraphql";
import { createFolderKeyDerivationTrace } from "./createFolderKeyDerivationTrace";

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
  const nameCiphertext = encryptedFolderResult.ciphertext;
  const nameNonce = encryptedFolderResult.publicNonce;

  const keyDerivationTrace = await createFolderKeyDerivationTrace({
    workspaceKeyId,
    parentFolderId,
  });
  keyDerivationTrace.trace.push({
    entryId: id,
    subkeyId,
    parentId: parentFolderId,
    context: folderDerivedKeyContext,
  });

  const query = gql`
    mutation createFolder($input: CreateFolderInput!) {
      createFolder(input: $input) {
        folder {
          id
          nameCiphertext
          nameNonce
          parentFolderId
          rootFolderId
          workspaceId
          keyDerivationTrace {
            workspaceKeyId
            trace {
              entryId
              subkeyId
              parentId
              context
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
        nameCiphertext,
        nameNonce,
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
