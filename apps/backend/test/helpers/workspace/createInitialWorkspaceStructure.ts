import {
  createDocumentKey,
  createIntroductionDocumentSnapshot,
  createSnapshotKey,
  encryptDocumentTitle,
  encryptFolderName,
  LocalDevice,
} from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import { createAndEncryptWorkspaceKeyForDevice } from "../device/createAndEncryptWorkspaceKeyForDevice";

export type WorkspaceParams = {
  id: string;
  name: string;
};

export type FolderParams = {
  id: string;
  name: string;
  idSignature: string;
};

export type DocumentParams = {
  id: string;
  name: string;
};

export type Params = {
  graphql: any;
  workspace: WorkspaceParams;
  folder: FolderParams;
  document: DocumentParams;
  creatorDevice: LocalDevice;
  webDevice: LocalDevice;
  authorizationHeader: string;
};

export const createInitialWorkspaceStructure = async ({
  graphql,
  workspace,
  folder,
  document,
  creatorDevice,
  webDevice,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const { nonce, ciphertext, workspaceKey } =
    await createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: creatorDevice.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: creatorDevice.encryptionPrivateKey,
    });
  const webDeviceWorkspaceKey = await createAndEncryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: webDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: creatorDevice.encryptionPrivateKey,
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
    name: folder.name,
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
    title: document.name,
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
  const documentEncryptionKey = sodium.from_base64(
    documentContentKeyResult.key
  );
  const snapshotKeyData = await createSnapshotKey({
    folderKey,
  });
  const documentSnapshot = await createIntroductionDocumentSnapshot({
    documentId: document.id,
    documentEncryptionKey,
    subkeyId: snapshotKeyData.subkeyId,
  });

  const result = await graphql.client.request(
    query,
    {
      input: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
          deviceWorkspaceKeyBoxes: [
            {
              deviceSigningPublicKey: creatorDevice.signingPublicKey,
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
        folder: {
          id: folder.id,
          idSignature: folder.idSignature,
          encryptedName: encryptedFolderName,
          encryptedNameNonce: encryptedFolderNameNonce,
          subkeyId: folderSubkeyId,
        },
        document: {
          id: document.id,
          encryptedName: encryptedDocumentName,
          encryptedNameNonce: encryptedDocumentNameNonce,
          subkeyId: documentSubkeyId,
          snapshot: documentSnapshot,
        },
      },
    },
    authorizationHeaders
  );
  return result;
};
