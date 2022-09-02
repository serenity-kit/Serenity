import {
  createDocumentKey,
  createIntroductionDocumentSnapshot,
  encryptDocumentTitle,
  encryptFolderName,
} from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import { createAndEncryptWorkspaceKeyForDevice } from "../device/createAndEncryptWorkspaceKeyForDevice";

type Params = {
  graphql: any;
  workspaceId: string;
  workspaceName: string;
  creatorDeviceSigningPublicKey?: string;
  deviceSigningPublicKey: string;
  deviceEncryptionPublicKey: string;
  deviceEncryptionPrivateKey: string;
  folderId: string;
  folderIdSignature: string;
  folderName: string;
  documentId: string;
  documentName: string;
  authorizationHeader: string;
};

export const createInitialWorkspaceStructure = async ({
  graphql,
  workspaceName,
  workspaceId,
  creatorDeviceSigningPublicKey,
  deviceSigningPublicKey,
  deviceEncryptionPublicKey,
  deviceEncryptionPrivateKey,
  folderId,
  folderIdSignature,
  folderName,
  documentId,
  documentName,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const { nonce, ciphertext, workspaceKey } =
    await createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: deviceEncryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: deviceEncryptionPrivateKey,
    });
  const query = gql`
    mutation createInitialWorkspaceStructure(
      $input: CreateInitialWorkspaceStructureInput!
    ) {
      createInitialWorkspaceStructure(input: $input) {
        workspace {
          id
          name
          members {
            userId
            isAdmin
          }
          currentWorkspaceKey {
            id
            workspaceId
            generation
            workspaceKeyBox {
              id
              workspaceKeyId
              deviceSigningPublicKey
              ciphertext
              nonce
            }
          }
        }
        folder {
          id
          name
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

  const encryptedFolderResult = await encryptFolderName({
    name: folderName,
    parentKey: workspaceKey,
  });
  const encryptedFolderName = encryptedFolderResult.ciphertext;
  const encryptedFolderNameNonce = encryptedFolderResult.publicNonce;
  const folderSubkeyId = encryptedFolderResult.folderSubkeyId;
  const folderKey = encryptedFolderResult.folderSubkey;

  const documentKeyResult = await createDocumentKey({
    folderKey,
  });
  const encryptedDocumentTitleResult = await encryptDocumentTitle({
    title: documentName,
    key: documentKeyResult.key,
  });
  const encryptedDocumentName = encryptedDocumentTitleResult.ciphertext;
  const encryptedDocumentNameNonce = encryptedDocumentTitleResult.publicNonce;
  const documentSubkeyId = documentKeyResult.subkeyId;

  // currently hard-coded until we enable e2e encryption per workspace
  const documentEncryptionKey = sodium.from_base64(
    "cksJKBDshtfjXJ0GdwKzHvkLxDp7WYYmdJkU1qPgM-0"
  );
  const documentSnapshot = await createIntroductionDocumentSnapshot({
    documentId,
    documentEncryptionKey,
  });

  const result = await graphql.client.request(
    query,
    {
      input: {
        workspaceName,
        workspaceId,
        folderId,
        folderIdSignature,
        folderName,
        encryptedFolderName,
        encryptedFolderNameNonce,
        folderSubkeyId,
        documentId,
        documentName,
        encryptedDocumentName,
        encryptedDocumentNameNonce,
        documentSubkeyId,
        documentSnapshot,
        deviceWorkspaceKeyBoxes: [
          {
            deviceSigningPublicKey,
            creatorDeviceSigningPublicKey:
              creatorDeviceSigningPublicKey ?? deviceSigningPublicKey,
            nonce,
            ciphertext,
          },
        ],
      },
    },
    authorizationHeaders
  );
  return result;
};
