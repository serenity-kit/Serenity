import {
  createDocumentKey,
  createIntroductionDocumentSnapshot,
  encryptDocumentTitle,
  encryptFolderName,
  LocalDevice,
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
  webDevice: LocalDevice;
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
  webDevice,
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
  const webDeviceWorkspaceKey = await createAndEncryptWorkspaceKeyForDevice({
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
            role
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
              creatorDevice {
                signingPublicKey
                encryptionPublicKey
              }
            }
          }
        }
        folder {
          id
          encryptedName
          encryptedNameNonce
          subkeyId
          workspaceKeyId
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
  const documentKey = documentKeyResult.key;
  const documentSubkeyId = documentKeyResult.subkeyId;
  const encryptedDocumentTitleResult = await encryptDocumentTitle({
    title: documentName,
    key: documentKey,
  });
  const encryptedDocumentName = encryptedDocumentTitleResult.ciphertext;
  const encryptedDocumentNameNonce = encryptedDocumentTitleResult.publicNonce;

  // currently hard-coded until we enable e2e encryption per workspace
  // const documentEncryptionKey = sodium.from_base64(
  //   "cksJKBDshtfjXJ0GdwKzHvkLxDp7WYYmdJkU1qPgM-0"
  // );
  const documentContentKeyResult = await createDocumentKey({
    folderKey,
  });
  const documentContentSubkeyId = documentContentKeyResult.subkeyId;
  const documentEncryptionKey = sodium.from_base64(
    documentContentKeyResult.key
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
        encryptedFolderName,
        encryptedFolderNameNonce,
        folderSubkeyId,
        documentId,
        encryptedDocumentName,
        encryptedDocumentNameNonce,
        documentSubkeyId,
        documentContentSubkeyId,
        documentSnapshot,
        creatorDeviceSigningPublicKey:
          creatorDeviceSigningPublicKey ?? deviceSigningPublicKey,
        deviceWorkspaceKeyBoxes: [
          {
            deviceSigningPublicKey,
            nonce,
            ciphertext,
          },
          {
            deviceSigningPublicKey: webDevice.signingPublicKey,
            nonce: webDeviceWorkspaceKey.nonce,
            ciphertext: webDeviceWorkspaceKey.ciphertext,
          },
        ],
      },
    },
    authorizationHeaders
  );
  return result;
};
