import * as documentChain from "@serenity-kit/document-chain";
import * as workspaceChain from "@serenity-kit/workspace-chain";
import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import {
  LocalDevice,
  createDocumentTitleKey,
  createIntroductionDocumentSnapshot,
  createSnapshotKey,
  encryptDocumentTitleByKey,
  encryptFolderName,
  encryptWorkspaceInfo,
  encryptWorkspaceKeyForDevice,
  folderDerivedKeyContext,
  generateId,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import sodium from "react-native-libsodium";
import { DeviceWorkspaceKeyBoxParams } from "../../../src/database/workspace/createWorkspace";
import { getAndConstructUserFromUserChainTestHelper } from "../userChain/getAndConstructUserFromUserChainTestHelper";

const query = gql`
  mutation createInitialWorkspaceStructure(
    $input: CreateInitialWorkspaceStructureInput!
  ) {
    createInitialWorkspaceStructure(input: $input) {
      workspace {
        id
        infoCiphertext
        infoNonce
        infoWorkspaceKey {
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
      document {
        id
        nameCiphertext
        nameNonce
        parentFolderId
        workspaceId
        subkeyId
      }
    }
  }
`;

type Params = {
  graphql: any;
  workspaceName: string;
  creatorDevice: LocalDevice;
  mainDevice: LocalDevice;
  devices: LocalDevice[];
  authorizationHeader: string;
};

export const createInitialWorkspaceStructure = async ({
  graphql,
  workspaceName,
  creatorDevice,
  mainDevice,
  devices,
  authorizationHeader,
}: Params) => {
  // create ids
  const event = workspaceChain.createChain({
    privateKey: mainDevice.signingPrivateKey,
    publicKey: mainDevice.signingPublicKey,
  });
  const workspaceChainState = await workspaceChain.resolveState([event]);

  const workspaceKeyId = generateId();
  const folderId = generateId();
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
      workspaceId: event.transaction.id,
      workspaceKeyId,
    });
    deviceWorkspaceKeyBoxes.push({
      deviceSigningPublicKey: device.signingPublicKey,
      ciphertext: deviceWorkspaceKeyBox.ciphertext,
      nonce: deviceWorkspaceKeyBox.nonce,
    });
  }

  const workspaceInfo = encryptWorkspaceInfo({
    name: workspaceName,
    key: workspaceKey,
  });

  const readyWorkspace = {
    infoCiphertext: workspaceInfo.ciphertext,
    infoNonce: workspaceInfo.nonce,
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
      "folder_id" + folderId,
      sodium.from_base64(creatorDevice.signingPrivateKey)
    )
  );
  const readyFolder = {
    id: folderId,
    idSignature: folderIdSignature,
    nameCiphertext: encryptedFolderName,
    nameNonce: encryptedFolderNameNonce,
    // since we haven't created the workspaceKey yet,
    // we must derive the trace manually
    keyDerivationTrace: {
      workspaceKeyId,
      trace: [
        {
          entryId: folderId,
          subkeyId: folderSubkeyId,
          parentId: null,
          context: folderDerivedKeyContext,
        },
      ],
    },
  };

  // prepare the snapshot key
  const snapshotKey = createSnapshotKey({
    folderKey,
  });
  // propare the document key
  const documentTitleKeyResult = createDocumentTitleKey({
    snapshotKey: snapshotKey.key,
  });
  const documentTitleKey = documentTitleKeyResult.key;
  const documentSubkeyId = documentTitleKeyResult.subkeyId;

  const encryptedDocumentTitleResult = encryptDocumentTitleByKey({
    title: documentName,
    key: documentTitleKey,
  });
  const encryptedDocumentName = encryptedDocumentTitleResult.ciphertext;
  const encryptedDocumentNameNonce = encryptedDocumentTitleResult.publicNonce;

  const createDocumentChainEvent = documentChain.createDocumentChain({
    authorKeyPair: {
      // devices[0] is the main device, devices[1] is the web device
      privateKey: devices[1].signingPrivateKey,
      publicKey: devices[1].signingPublicKey,
    },
  });
  const documentChainState = documentChain.resolveState({
    events: [createDocumentChainEvent],
    knownVersion: documentChain.version,
  });
  const snapshotId = generateId();

  const userChainUser = await getAndConstructUserFromUserChainTestHelper({
    mainDeviceSigningPublicKey: mainDevice.signingPublicKey,
  });

  const workspaceMemberDevicesProof =
    workspaceMemberDevicesProofUtil.createWorkspaceMemberDevicesProof({
      authorKeyPair: {
        privateKey: sodium.from_base64(mainDevice.signingPrivateKey),
        publicKey: sodium.from_base64(mainDevice.signingPublicKey),
        keyType: "ed25519",
      },
      workspaceMemberDevicesProofData: {
        clock: 0,
        userChainHashes: {
          [userChainUser.userId]: userChainUser.userChainState.eventHash,
        },
        workspaceChainHash: workspaceChainState.lastEventHash,
      },
    });

  const snapshot = createIntroductionDocumentSnapshot({
    documentId: createDocumentChainEvent.transaction.id,
    snapshotEncryptionKey: sodium.from_base64(snapshotKey.key),
    documentChainEventHash: documentChainState.currentState.eventHash,
    workspaceMemberDevicesProof,
    keyDerivationTrace: {
      workspaceKeyId,
      trace: [
        {
          entryId: folderId,
          parentId: null,
          subkeyId: encryptedFolderResult.folderSubkeyId,
          context: folderDerivedKeyContext,
        },
        {
          entryId: snapshotId,
          parentId: folderId,
          subkeyId: snapshotKey.subkeyId,
          context: snapshotDerivedKeyContext,
        },
      ],
    },
    device: creatorDevice,
  });

  // prepare the document
  const readyDocument = {
    nameCiphertext: encryptedDocumentName,
    nameNonce: encryptedDocumentNameNonce,
    subkeyId: documentSubkeyId,
    snapshot,
    serializedDocumentChainEvent: JSON.stringify(createDocumentChainEvent),
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
        serializedWorkspaceChainEvent: JSON.stringify(event),
        serializedWorkspaceMemberDevicesProof: JSON.stringify(
          workspaceMemberDevicesProof
        ),
        folder: readyFolder,
        document: readyDocument,
        creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
      },
    },
    authorizationHeaders
  );
  return result;
};
