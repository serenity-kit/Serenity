import {
  createCommentKey,
  Device,
  encryptComment,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import { deriveDocumentKey } from "../document/deriveDocumentKey";
import { getDocument } from "../document/getDocument";
import { buildFolderKeyTrace } from "../folder/buildFolderKeyTrace";
import { getFolder } from "../folder/getFolder";
import { getWorkspace } from "../workspace/getWorkspace";

type Params = {
  graphql: any;
  commentId: string;
  documentId: string;
  comment: string;
  authorizationHeader: string;
  creatorDevice: Device;
  creatorDeviceEncryptionPrivateKey: string;
  creatorDeviceSigningPrivateKey: string;
};

export const createCommentReply = async ({
  graphql,
  commentId,
  documentId,
  comment,
  creatorDevice,
  creatorDeviceEncryptionPrivateKey,
  creatorDeviceSigningPrivateKey,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const documentResult = await getDocument({
    graphql,
    id: documentId,
    authorizationHeader,
  });
  const document = documentResult.document;

  const workspaceKeyId = document.nameKeyDerivationTrace.workspaceKeyId;
  const parentFolderId = document.parentFolderId;
  const subkeyId = document.nameKeyDerivationTrace.subkeyId;

  const workspaceResult = await getWorkspace({
    graphql,
    workspaceId: document.workspaceId!,
    deviceSigningPublicKey: creatorDevice.signingPublicKey,
    authorizationHeader,
  });
  const workspace = workspaceResult.workspace;

  const folderResult = await getFolder({
    graphql,
    id: document.parentFolderId!,
    authorizationHeader,
  });
  const folder = folderResult.folder;

  const documentKeyData = await deriveDocumentKey({
    documentSubkeyId: document.nameKeyDerivationTrace.subkeyId,
    parentFolderId: document.parentFolderId!,
    workspaceId: document.workspaceId!,
    keyDerivationTrace: folder.keyDerivationTrace,
    overrideWithWorkspaceKeyId: workspace.currentWorkspaceKey.id,
    activeDevice: {
      ...creatorDevice,
      signingPrivateKey: creatorDeviceSigningPrivateKey,
      encryptionPrivateKey: creatorDeviceEncryptionPrivateKey,
    },
  });
  const documentNameKey = documentKeyData.documentKey;
  const commentKey = createCommentKey({
    documentNameKey: documentNameKey.key,
  });
  const { ciphertext, publicNonce } = encryptComment({
    comment,
    key: commentKey.key,
  });

  const contentKeyDerivationTrace = await buildFolderKeyTrace({
    workspaceKeyId,
    subkeyId,
    parentFolderId,
  });

  const query = gql`
    mutation createCommentReply($input: CreateCommentReplyInput!) {
      createCommentReply(input: $input) {
        commentReply {
          id
          commentId
          documentId
          encryptedContent
          encryptedContentNonce
          creatorDevice {
            signingPublicKey
            encryptionPublicKey
            encryptionPublicKeySignature
            createdAt
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      input: {
        commentId,
        documentId,
        encryptedContent: ciphertext,
        encryptedContentNonce: publicNonce,
        contentKeyDerivationTrace,
      },
    },
    authorizationHeaders
  );
  return result;
};