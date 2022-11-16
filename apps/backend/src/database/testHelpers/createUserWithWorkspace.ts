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
import { createInitialWorkspaceStructure } from "../../database/workspace/createInitialWorkspaceStructure";
import { finishRegistration, startRegistration } from "../../utils/opaque";
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
  const mainDevice = await createAndEncryptDevice(exportKey);

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
  const deviceEncryptionPrivateKey = result.encryptionPrivateKey;
  const deviceEncryptionPublicKey = device.encryptionPublicKey;
  const deviceSigningPrivateKey = result.signingPrivateKey;
  const { nonce, ciphertext, workspaceKey } =
    await createAndEncryptWorkspaceKeyForDevice({
      receiverDeviceEncryptionPublicKey: deviceEncryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: deviceEncryptionPrivateKey,
    });
  const folderName = "Getting Started";
  const encryptedFolderResult = await encryptFolderName({
    name: folderName,
    parentKey: workspaceKey,
  });
  const folderKey = encryptedFolderResult.folderSubkey;
  const docmentKeyResult = await createDocumentKey({
    folderKey,
  });
  const snapshotKey = await createSnapshotKey({
    folderKey: encryptedFolderResult.folderSubkey,
  });
  // FIXME: due to a hack, we are using the snapshotKey
  // to encrypt the document title, instead of a document key
  // const documentKey = docmentKeyResult.key;
  const documentKey = snapshotKey.key;
  const documentSubkeyId = snapshotKey.subkeyId;
  const encryptedDocumentTitleResult = await encryptDocumentTitle({
    title: documentName,
    key: documentKey,
  });
  // const documentEncryptionKey = sodium.from_base64(
  //   "cksJKBDshtfjXJ0GdwKzHvkLxDp7WYYmdJkU1qPgM-0"
  // );
  const documentSnapshot = await createIntroductionDocumentSnapshot({
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
    workspaceId: id,
    workspaceName: "My Workspace",
    folderId,
    folderIdSignature: uuidv4(),
    encryptedFolderName: encryptedFolderResult.ciphertext,
    encryptedFolderNameNonce: encryptedFolderResult.publicNonce,
    folderSubkeyId: encryptedFolderResult.folderSubkeyId,
    documentId,
    encryptedDocumentName: encryptedDocumentTitleResult.ciphertext,
    encryptedDocumentNameNonce: encryptedDocumentTitleResult.publicNonce,
    documentSubkeyId,
    documentContentSubkeyId: 123, // TODO: remove
    documentSnapshot,
    creatorDeviceSigningPublicKey: device.signingPublicKey,
    deviceWorkspaceKeyBoxes: [
      {
        deviceSigningPublicKey: device.signingPublicKey,
        nonce,
        ciphertext,
      },
    ],
  });

  const { session, sessionKey, webDevice } = await createDeviceAndLogin({
    username,
    password: thePassword,
    envelope,
  });

  return {
    ...result,
    session,
    sessionKey,
    device,
    deviceEncryptionPrivateKey,
    deviceSigningPrivateKey,
    webDevice,
    user,
    envelope,
    workspace: createWorkspaceResult.workspace,
    folder: createWorkspaceResult.folder,
    document: createWorkspaceResult.document,
    snapshot: createWorkspaceResult.snapshot,
  };
}
