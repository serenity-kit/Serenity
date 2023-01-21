import {
  createDocumentKey,
  createIntroductionDocumentSnapshot,
  createSnapshotKey,
  encryptDocumentTitle,
  encryptFolderName,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
import { DeviceWorkspaceKeyBoxParams } from "../../../src/database/workspace/createWorkspace";
import { Device } from "../../../src/types/device";
import { encryptWorkspaceKeyForDevice } from "../device/encryptWorkspaceKeyForDevice";

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
      document {
        id
        encryptedName
        encryptedNameNonce
        parentFolderId
        workspaceId
        nameKeyDerivationTrace {
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

type CreatorDeviceParams = {
  signingPublicKey: string;
  signingPrivateKey: string;
  encryptionPublicKey: string;
  encryptionPrivateKey: string;
};

type Params = {
  graphql: any;
  workspaceName: string;
  creatorDevice: CreatorDeviceParams;
  devices: Device[];
  authorizationHeader: string;
};

export const createInitialWorkspaceStructure = async ({
  graphql,
  workspaceName,
  creatorDevice,
  devices,
  authorizationHeader,
}: Params) => {
  // create ids
  const workspaceId = uuidv4();
  const workspaceKeyId = uuidv4();
  const folderId = uuidv4();
  const documentId = uuidv4();

  const folderName = "Getting Started";
  const documentName = "Introduction";

  // create workspace key boxes
  const workspaceKey = sodium.to_base64(sodium.crypto_kdf_keygen());
  const deviceWorkspaceKeyBoxes: DeviceWorkspaceKeyBoxParams[] = [];
  for (const device of devices) {
    const deviceWorkspaceKeyBox = encryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: device.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: creatorDevice.encryptionPrivateKey,
      workspaceKey,
    });
    deviceWorkspaceKeyBoxes.push({
      deviceSigningPublicKey: device.signingPublicKey,
      ciphertext: deviceWorkspaceKeyBox.ciphertext,
      nonce: deviceWorkspaceKeyBox.nonce,
    });
  }
  const readyWorkspace = {
    id: workspaceId,
    name: workspaceName,
    workspaceKeyId,
    deviceWorkspaceKeyBoxes,
  };

  // prepare the folder
  const encryptedFolderResult = encryptFolderName({
    name: folderName,
    parentKey: workspaceKey,
  });
  const encryptedFolderName = encryptedFolderResult.ciphertext;
  const encryptedFolderNameNonce = encryptedFolderResult.publicNonce;
  const folderSubkeyId = encryptedFolderResult.folderSubkeyId;
  const folderKey = encryptedFolderResult.folderSubkey;
  const folderIdSignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      folderId,
      sodium.from_base64(creatorDevice.signingPrivateKey)
    )
  );
  const readyFolder = {
    id: folderId,
    idSignature: folderIdSignature,
    encryptedName: encryptedFolderName,
    encryptedNameNonce: encryptedFolderNameNonce,
    keyDerivationTrace: {
      workspaceKeyId,
      subkeyId: folderSubkeyId,
      parentFolders: [],
    },
  };

  // propare the document key
  const documentKeyResult = createDocumentKey({
    folderKey,
  });
  const documentKey = documentKeyResult.key;
  const documentSubkeyId = documentKeyResult.subkeyId;

  const encryptedDocumentTitleResult = encryptDocumentTitle({
    title: documentName,
    key: documentKey,
  });
  const encryptedDocumentName = encryptedDocumentTitleResult.ciphertext;
  const encryptedDocumentNameNonce = encryptedDocumentTitleResult.publicNonce;

  // prepare the snapshot key
  const snapshotKey = createSnapshotKey({
    folderKey,
  });
  const snapshot = createIntroductionDocumentSnapshot({
    documentId,
    snapshotEncryptionKey: sodium.from_base64(snapshotKey.key),
    subkeyId: snapshotKey.subkeyId,
    keyDerivationTrace: {
      workspaceKeyId,
      subkeyId: snapshotKey.subkeyId,
      parentFolders: [
        {
          folderId: folderId,
          subkeyId: encryptedFolderResult.folderSubkeyId,
          parentFolderId: null,
        },
      ],
    },
  });

  // prepare the document
  const readyDocument = {
    id: documentId,
    encryptedName: encryptedDocumentName,
    encryptedNameNonce: encryptedDocumentNameNonce,
    nameKeyDerivationTrace: {
      workspaceKeyId,
      subkeyId: documentSubkeyId,
      parentFolders: [
        {
          folderId: folderId,
          subkeyId: folderSubkeyId,
          parentFolderId: null,
        },
      ],
    },
    snapshot,
  };

  // create the initial workspace structure
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const result = await graphql.client.request(
    query,
    {
      input: {
        workspace: readyWorkspace,
        folder: readyFolder,
        document: readyDocument,
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
      },
    },
    authorizationHeaders
  );
  return result;
};
