import { encryptFolderName } from "@serenity-tools/common";
import { createSubkeyId } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { createFolderKeyDerivationTrace } from "./createFolderKeyDerivationTrace";

type Params = {
  graphql: any;
  id: string;
  name: string;
  workspaceKey: string;
  workspaceKeyId: string;
  parentFolderId: string | null | undefined;
  authorizationHeader: string;
  workspaceId: string;
};

export const updateFolderName = async ({
  graphql,
  id,
  name,
  workspaceKey,
  workspaceKeyId,
  parentFolderId,
  authorizationHeader,
  workspaceId,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const subkeyId = createSubkeyId();
  const keyDerivationTrace = await createFolderKeyDerivationTrace({
    workspaceKeyId,
    parentFolderId,
  });
  const encryptedFolderResult = encryptFolderName({
    name,
    parentKey: workspaceKey,
    folderId: id,
    keyDerivationTrace,
    subkeyId,
    workspaceId,
  });

  const query = gql`
    mutation updateFolderName($input: UpdateFolderNameInput!) {
      updateFolderName(input: $input) {
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
        nameCiphertext: encryptedFolderResult.ciphertext,
        nameNonce: encryptedFolderResult.nonce,
        workspaceKeyId,
        subkeyId: encryptedFolderResult.folderSubkeyId,
        keyDerivationTrace,
      },
    },
    authorizationHeaders
  );
  return result;
};
