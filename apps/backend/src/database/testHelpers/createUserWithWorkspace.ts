import {
  createAndEncryptDevice,
  createDocumentKey,
  createIntroductionDocumentSnapshot,
  createSnapshotKey,
  encryptDocumentTitle,
  encryptFolderName,
} from "@serenity-tools/common";
import * as sodium from "@serenity-tools/libsodium";
import { Registration } from "@serenity-tools/opaque-server";
import { v4 as uuidv4 } from "uuid";
import { createAndEncryptWorkspaceKeyForDevice } from "../../../test/helpers/device/createAndEncryptWorkspaceKeyForDevice";
import { encryptWorkspaceKeyForDevice } from "../../../test/helpers/device/encryptWorkspaceKeyForDevice";
import { createInitialWorkspaceStructure } from "../../database/workspace/createInitialWorkspaceStructure";
import { finishRegistration, startRegistration } from "../../utils/opaque";
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
  // setup server registration opaque
  const registration = new Registration();
  const challenge = registration.start(thePassword);
  const { response, registrationId } = startRegistration({
    username,
    challenge: sodium.to_base64(challenge),
  });
  const message = registration.finish(sodium.from_base64(response));
  const exportKey = sodium.to_base64(registration.getExportKey());
  const { envelope } = finishRegistration({
    registrationId,
    message: sodium.to_base64(message),
  });
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
        opaqueEnvelope: envelope,
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

  const documentId = uuidv4();
  const folderId = uuidv4();
  const workspaceKeyId = uuidv4();
  const documentName = "Introduction";
  const user = result.user;
  const device = result.device;
  const { nonce, ciphertext, workspaceKey } =
    await createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: mainDevice.encryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: mainDevice.encryptionPrivateKey,
    });
  const folderName = "Getting Started";
  const folderIdSignature = await sodium.crypto_sign_detached(
    folderId,
    mainDevice.signingPrivateKey
  );
  const encryptedFolderResult = encryptFolderName({
    name: folderName,
    parentKey: workspaceKey,
  });
  const folderKey = encryptedFolderResult.folderSubkey;
  const docmentKeyResult = createDocumentKey({
    folderKey,
  });
  const snapshotKey = createSnapshotKey({
    folderKey,
  });
  const documentKey = docmentKeyResult.key;
  const encryptedDocumentTitleResult = encryptDocumentTitle({
    title: documentName,
    key: documentKey,
  });
  // const documentEncryptionKey = sodium.from_base64(
  //   "cksJKBDshtfjXJ0GdwKzHvkLxDp7WYYmdJkU1qPgM-0"
  // );
  const snapshot = createIntroductionDocumentSnapshot({
    documentId,
    snapshotEncryptionKey: sodium.from_base64(snapshotKey.key),
    subkeyId: snapshotKey.subkeyId,
    keyDerivationTrace: {
      workspaceKeyId,
      subkeyId: snapshotKey.subkeyId,
      parentFolders: [
        {
          folderId,
          subkeyId: encryptedFolderResult.folderSubkeyId,
          parentFolderId: null,
        },
      ],
    },
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
    folder: {
      id: folderId,
      idSignature: folderIdSignature,
      encryptedName: encryptedFolderResult.ciphertext,
      encryptedNameNonce: encryptedFolderResult.publicNonce,
      keyDerivationTrace: {
        workspaceKeyId,
        subkeyId: encryptedFolderResult.folderSubkeyId,
        parentFolders: [],
      },
    },
    document: {
      id: documentId,
      encryptedName: encryptedDocumentTitleResult.ciphertext,
      encryptedNameNonce: encryptedDocumentTitleResult.publicNonce,
      nameKeyDerivationTrace: {
        workspaceKeyId,
        subkeyId: docmentKeyResult.subkeyId,
        parentFolders: [
          {
            folderId,
            subkeyId: encryptedFolderResult.folderSubkeyId,
            parentFolderId: null,
          },
        ],
      },
      snapshot,
    },
    creatorDeviceSigningPublicKey: device.signingPublicKey,
  });

  const { session, sessionKey, webDevice } = await createDeviceAndLogin({
    username,
    password: thePassword,
    envelope,
  });

  const webDeviceWorkspaceKeyBox = await encryptWorkspaceKeyForDevice({
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
    envelope,
    workspace: createWorkspaceResult.workspace,
    folder: createWorkspaceResult.folder,
    document: createWorkspaceResult.document,
    snapshot: createWorkspaceResult.snapshot,
  };
}
