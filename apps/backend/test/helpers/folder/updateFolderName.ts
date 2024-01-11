import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
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
  workspaceMemberDevicesProof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
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
  workspaceMemberDevicesProof,
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
    workspaceMemberDevicesProof,
  });

  const query = gql`
    mutation updateFolderName($input: UpdateFolderNameInput!) {
      updateFolderName(input: $input) {
        folder {
          id
          nameCiphertext
          nameNonce
          signature
          workspaceMemberDevicesProofHash
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
        signature: "TODO",
        workspaceKeyId,
        subkeyId: encryptedFolderResult.folderSubkeyId,
        workspaceMemberDevicesProofHash: workspaceMemberDevicesProof.hash,
        keyDerivationTrace,
      },
    },
    authorizationHeaders
  );
  return result;
};
