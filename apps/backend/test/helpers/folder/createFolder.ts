import {
  LocalDevice,
  encryptFolderName,
  folderDerivedKeyContext,
} from "@serenity-tools/common";
import { createSubkeyId } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { getWorkspaceMemberDevicesProof } from "../../../src/database/workspace/getWorkspaceMemberDevicesProof";
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
  userId: string;
  device: LocalDevice;
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
  userId,
  device,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const folderSubkeyId = createSubkeyId();
  const keyDerivationTrace = await createFolderKeyDerivationTrace({
    workspaceKeyId,
    parentFolderId,
  });
  keyDerivationTrace.trace.push({
    entryId: id,
    subkeyId: folderSubkeyId,
    parentId: parentFolderId,
    context: folderDerivedKeyContext,
  });

  const workspaceMemberDevicesProof = await getWorkspaceMemberDevicesProof({
    userId,
    workspaceId,
  });

  const encryptedFolderResult = encryptFolderName({
    name,
    parentKey,
    folderId: id,
    keyDerivationTrace,
    subkeyId: folderSubkeyId,
    workspaceId,
    workspaceMemberDevicesProof: workspaceMemberDevicesProof.proof,
    device,
  });
  const nameCiphertext = encryptedFolderResult.ciphertext;
  const nameNonce = encryptedFolderResult.nonce;

  const query = gql`
    mutation createFolder($input: CreateFolderInput!) {
      createFolder(input: $input) {
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
  const result = await graphql.client.request<any>(
    query,
    {
      input: {
        id,
        nameCiphertext,
        nameNonce,
        signature: encryptedFolderResult.signature,
        workspaceMemberDevicesProofHash: workspaceMemberDevicesProof.proof.hash,
        parentFolderId,
        workspaceKeyId,
        subkeyId: folderSubkeyId,
        workspaceId,
        keyDerivationTrace,
      },
    },
    authorizationHeaders
  );
  return result;
};
