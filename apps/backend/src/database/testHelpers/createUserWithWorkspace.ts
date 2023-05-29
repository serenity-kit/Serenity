import {
  clientRegistrationFinish,
  clientRegistrationStart,
  serverRegistrationFinish,
  serverRegistrationStart,
} from "@serenity-kit/opaque";
import * as workspaceChain from "@serenity-kit/workspace-chain";
import {
  createAndEncryptDevice,
  createAndEncryptWorkspaceKeyForDevice,
  createDocumentTitleKey,
  createIntroductionDocumentSnapshot,
  createSnapshotKey,
  encryptDocumentTitleByKey,
  encryptFolderName,
  encryptWorkspaceKeyForDevice,
  folderDerivedKeyContext,
  generateId,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import sodium from "react-native-libsodium";
import { createInitialWorkspaceStructure } from "../../database/workspace/createInitialWorkspaceStructure";
import { attachDeviceToWorkspaces } from "../device/attachDeviceToWorkspaces";
import { prisma } from "../prisma";
import { createDeviceAndLogin } from "./createDeviceAndLogin";

type Params = {
  id: string;
  username: string;
  password?: string;
};

export default async function createUserWithWorkspace({
  id,
  username,
  password,
}: Params) {
  let thePassword = "12345689";
  if (password) {
    thePassword = password;
  }

  if (!process.env.OPAQUE_SERVER_SETUP) {
    throw new Error("Missing process.env.OPAQUE_SERVER_SETUP");
  }

  const clientRegistrationStartResult = clientRegistrationStart(thePassword);
  const serverRegistrationStartResult = serverRegistrationStart({
    userIdentifier: username,
    registrationRequest: clientRegistrationStartResult.registrationRequest,
    serverSetup: process.env.OPAQUE_SERVER_SETUP,
  });
  const clientRegistrationFinishResult = clientRegistrationFinish({
    clientRegistration: clientRegistrationStartResult.clientRegistration,
    password: thePassword,
    registrationResponse: serverRegistrationStartResult,
  });
  const exportKey = clientRegistrationFinishResult.exportKey;

  const passwordFile = serverRegistrationFinish(
    clientRegistrationFinishResult.registrationUpload
  );
  const mainDevice = createAndEncryptDevice(exportKey);

  const result = await prisma.$transaction(async (prisma) => {
    const device = await prisma.device.create({
      data: {
        signingPublicKey: mainDevice.signingPublicKey,
        encryptionPublicKey: mainDevice.encryptionPublicKey,
        encryptionPublicKeySignature: mainDevice.encryptionPublicKeySignature,
      },
    });

    const user = await prisma.user.create({
      data: {
        username,
        opaqueEnvelope: passwordFile,
        mainDeviceCiphertext: mainDevice.ciphertext,
        mainDeviceNonce: mainDevice.nonce,
        mainDeviceSigningPublicKey: mainDevice.signingPublicKey,
        mainDeviceEncryptionKeySalt: mainDevice.encryptionKeySalt,
        devices: {
          connect: {
            signingPublicKey: device.signingPublicKey,
          },
        },
      },
    });
    return {
      user,
      device,
      encryptionPrivateKey: mainDevice.encryptionPrivateKey,
      signingPrivateKey: mainDevice.signingPrivateKey,
    };
  });

  const documentId = generateId();
  const folderId = generateId();
  const workspaceKeyId = generateId();
  const documentName = "Introduction";
  const user = result.user;
  const device = result.device;
  const { nonce, ciphertext, workspaceKey } =
    createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: mainDevice.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: mainDevice.encryptionPrivateKey,
    });
  const folderName = "Getting Started";
  const folderIdSignature = sodium.to_base64(
    sodium.crypto_sign_detached(
      folderId,
      sodium.from_base64(mainDevice.signingPrivateKey)
    )
  );
  const encryptedFolderResult = encryptFolderName({
    name: folderName,
    parentKey: workspaceKey,
  });
  const folderKey = encryptedFolderResult.folderSubkey;
  const snapshotKey = createSnapshotKey({
    folderKey,
  });
  const documentTitleKeyResult = createDocumentTitleKey({
    snapshotKey: snapshotKey.key,
  });
  const documentTitleKey = documentTitleKeyResult.key;
  const encryptedDocumentTitleResult = encryptDocumentTitleByKey({
    title: documentName,
    key: documentTitleKey,
  });
  const snapshotId = generateId();
  const snapshot = createIntroductionDocumentSnapshot({
    documentId,
    snapshotEncryptionKey: sodium.from_base64(snapshotKey.key),
    subkeyId: snapshotKey.subkeyId,
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
    device: mainDevice,
  });

  const createWorkspaceChainEvent = workspaceChain.createChain({
    privateKey: mainDevice.signingPrivateKey,
    publicKey: mainDevice.signingPublicKey,
  });

  const createWorkspaceResult = await createInitialWorkspaceStructure({
    userId: user.id,
    workspace: {
      id,
      name: "My Workspace",
      workspaceKeyId,
      deviceWorkspaceKeyBoxes: [
        {
          deviceSigningPublicKey: device.signingPublicKey,
          nonce,
          ciphertext,
        },
      ],
    },
    workspaceChainEvent: createWorkspaceChainEvent,
    folder: {
      id: folderId,
      idSignature: folderIdSignature,
      nameCiphertext: encryptedFolderResult.ciphertext,
      nameNonce: encryptedFolderResult.publicNonce,
      keyDerivationTrace: {
        workspaceKeyId,
        trace: [
          {
            entryId: folderId,
            subkeyId: encryptedFolderResult.folderSubkeyId,
            parentId: null,
            context: folderDerivedKeyContext,
          },
        ],
      },
    },
    document: {
      id: documentId,
      nameCiphertext: encryptedDocumentTitleResult.ciphertext,
      nameNonce: encryptedDocumentTitleResult.publicNonce,
      subkeyId: documentTitleKeyResult.subkeyId,
      snapshot,
    },
    creatorDeviceSigningPublicKey: device.signingPublicKey,
  });

  const { session, sessionKey, webDevice } = await createDeviceAndLogin({
    username,
    password: thePassword,
    envelope: passwordFile,
  });

  const webDeviceWorkspaceKeyBox = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: webDevice.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: mainDevice.encryptionPrivateKey,
    workspaceKey,
  });

  await attachDeviceToWorkspaces({
    userId: user.id,
    receiverDeviceSigningPublicKey: webDevice.signingPublicKey,
    creatorDeviceSigningPublicKey: mainDevice.signingPublicKey,
    workspaceKeyBoxes: [
      {
        workspaceId: createWorkspaceResult.workspace.id,
        workspaceKeyDevicePairs: [
          {
            workspaceKeyId:
              createWorkspaceResult.workspace.currentWorkspaceKey?.id!,
            nonce: webDeviceWorkspaceKeyBox.nonce,
            ciphertext: webDeviceWorkspaceKeyBox.ciphertext,
          },
        ],
      },
    ],
  });

  if (createWorkspaceResult.workspace.currentWorkspaceKey?.workspaceKeyBox) {
    createWorkspaceResult.workspace.currentWorkspaceKey.workspaceKeyBox.creatorDevice =
      mainDevice;
  }

  return {
    ...result,
    session,
    sessionKey,
    device,
    mainDevice: { ...mainDevice, userId: user.id, createdAt: new Date() },
    deviceEncryptionPrivateKey: mainDevice.encryptionPrivateKey,
    deviceSigningPrivateKey: mainDevice.signingPrivateKey,
    webDevice,
    user,
    envelope: passwordFile,
    workspace: createWorkspaceResult.workspace,
    folder: createWorkspaceResult.folder,
    document: createWorkspaceResult.document,
    snapshot: createWorkspaceResult.snapshot,
    snapshotKey,
  };
}
