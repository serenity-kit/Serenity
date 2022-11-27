import { createSnapshot, createUpdate } from "@naisho/core";
import {
  createSnapshotKey,
  folderDerivedKeyContext,
  LocalDevice,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import sodium, { KeyPair } from "@serenity-tools/libsodium";
import deleteAllRecords from "../test/helpers/deleteAllRecords";
import { decryptWorkspaceKey } from "../test/helpers/device/decryptWorkspaceKey";
import { createDocument } from "../test/helpers/document/createDocument";
import setupGraphql from "../test/helpers/setupGraphql";
import {
  createSocketClient,
  waitForClientState,
} from "../test/helpers/websocket";
import { prisma } from "./database/prisma";
import createUserWithWorkspace from "./database/testHelpers/createUserWithWorkspace";
import { Device } from "./types/device";

let server;

const graphql = setupGraphql();
const username = "59f80f08-c065-4acc-a542-2725fb2dff6c@example.com";
const workspaceId = "2d008bf8-87c4-4439-9b4b-9a0ec3919479";
const documentId = "72fbd941-42b7-4263-89fe-65bf43f455a7";
let userId: string | null = null;
let device: Device | null = null;
let webDevice: LocalDevice | null = null;
let sessionKey = "";
let workspaceKey = "";
let addedFolder: any = null;
let folderKey = "";
let addedWorkspace: any = null;
let snapshotId: string = "";
let latestServerVersion = null;

const setup = async () => {
  const result = await createUserWithWorkspace({
    id: workspaceId,
    username,
  });
  userId = result.user.id;
  device = result.device;
  webDevice = result.webDevice;
  sessionKey = result.sessionKey;
  addedWorkspace = result.workspace;
  const workspaceKeyBox = addedWorkspace.currentWorkspaceKey?.workspaceKeyBox;
  workspaceKey = await decryptWorkspaceKey({
    ciphertext: workspaceKeyBox?.ciphertext!,
    nonce: workspaceKeyBox?.nonce!,
    creatorDeviceEncryptionPublicKey: result.device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: result.encryptionPrivateKey,
  });
  addedFolder = result.folder;
  const folderKeyResult = await kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: addedFolder.subkeyId,
  });
  folderKey = folderKeyResult.key;

  const createDocumentResponse = await createDocument({
    graphql,
    id: documentId,
    parentFolderId: addedFolder.parentFolderId,
    workspaceId,
    contentSubkeyId: 42,
    authorizationHeader: sessionKey,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("successfully creates a snapshot", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${sessionKey}`,
    2
  );

  await waitForClientState(client, client.OPEN);

  const snapshotKey = await createSnapshotKey({ folderKey });
  const keyDerivationTrace = {
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    subkeyId: snapshotKey.subkeyId,
    parentFolders: [
      {
        folderId: addedFolder.id,
        subkeyId: addedFolder.subkeyId,
        parentFolderId: null,
      },
    ],
  };
  const signatureKeyPair: KeyPair = {
    publicKey: sodium.from_base64(webDevice!.signingPublicKey),
    privateKey: sodium.from_base64(webDevice!.signingPrivateKey),
    keyType: "ed25519",
  };
  const publicData = {
    snapshotId: "be0fa80f-4c6b-47f9-b2d4-ac1cc9f3e31b",
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    keyDerivationTrace,
    subkeyId: snapshotKey.subkeyId,
  };
  const snapshot = await createSnapshot(
    "CONTENT DUMMY",
    publicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair
  );
  snapshotId = snapshot.publicData.snapshotId;
  client.send(
    JSON.stringify({
      ...snapshot,
      lastKnownSnapshotId: null,
      latestServerVersion,
    })
  );

  await waitForClientState(client, client.CLOSED);
  expect(messages[1].type).toEqual("snapshotSaved");
  expect(messages[1].docId).toEqual(documentId);
  expect(messages[1].snapshotId).toEqual(snapshotId);
});

test("successfully creates an update", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${sessionKey}`,
    2
  );

  await waitForClientState(client, client.OPEN);

  const snapshotKey = await createSnapshotKey({ folderKey });
  const signatureKeyPair: KeyPair = {
    publicKey: sodium.from_base64(webDevice!.signingPublicKey),
    privateKey: sodium.from_base64(webDevice!.signingPrivateKey),
    keyType: "ed25519",
  };

  const publicData = {
    refSnapshotId: snapshotId,
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };
  const updateToSend = await createUpdate(
    "UPDATE CONTENT DUMMY",
    publicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair
  );

  client.send(JSON.stringify(updateToSend));

  await waitForClientState(client, client.CLOSED);
  expect(messages[1].type).toEqual("updateSaved");
  expect(messages[1].clock).toEqual(0);
  expect(messages[1].docId).toEqual(documentId);
  expect(messages[1].snapshotId).toEqual(snapshotId);
  expect(messages[1].serverVersion).toEqual(1);
  latestServerVersion = messages[1].serverVersion;
});

test("if document is set to requiresSnapshot updates will fail", async () => {
  await prisma.document.update({
    where: { id: documentId },
    data: { requiresSnapshot: true },
  });

  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${sessionKey}`,
    2
  );

  await waitForClientState(client, client.OPEN);

  const snapshotKey = await createSnapshotKey({ folderKey });
  const signatureKeyPair: KeyPair = {
    publicKey: sodium.from_base64(webDevice!.signingPublicKey),
    privateKey: sodium.from_base64(webDevice!.signingPrivateKey),
    keyType: "ed25519",
  };

  const publicData = {
    refSnapshotId: snapshotId,
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };
  const updateToSend = await createUpdate(
    "UPDATE CONTENT DUMMY",
    publicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair
  );

  client.send(JSON.stringify(updateToSend));

  await waitForClientState(client, client.CLOSED);
  expect(messages[1].type).toEqual("updateFailed");
  expect(messages[1].clock).toEqual(1);
  expect(messages[1].requiresNewSnapshotWithKeyRotation).toBe(true);
  expect(messages[1].docId).toEqual(documentId);
  expect(messages[1].snapshotId).toEqual(snapshotId);
});

test("successfully creates a snapshot and update", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${sessionKey}`,
    3
  );

  await waitForClientState(client, client.OPEN);

  const snapshotKey = await createSnapshotKey({ folderKey });
  const keyDerivationTrace = {
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    subkeyId: snapshotKey.subkeyId,
    parentFolders: [
      {
        folderId: addedFolder.id,
        subkeyId: addedFolder.subkeyId,
        parentFolderId: null,
      },
    ],
  };
  const signatureKeyPair: KeyPair = {
    publicKey: sodium.from_base64(webDevice!.signingPublicKey),
    privateKey: sodium.from_base64(webDevice!.signingPrivateKey),
    keyType: "ed25519",
  };
  const publicData = {
    snapshotId: "9674b24a-bb14-4f7e-bc81-dd49906a28fd",
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    keyDerivationTrace,
    subkeyId: snapshotKey.subkeyId,
  };
  const snapshot = await createSnapshot(
    "CONTENT DUMMY",
    publicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair
  );
  client.send(
    JSON.stringify({
      ...snapshot,
      lastKnownSnapshotId: snapshotId,
      latestServerVersion,
    })
  );
  snapshotId = snapshot.publicData.snapshotId;

  const updatePublicData = {
    refSnapshotId: snapshotId,
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };
  const updateToSend = await createUpdate(
    "UPDATE CONTENT DUMMY",
    updatePublicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair
  );

  client.send(JSON.stringify(updateToSend));

  await waitForClientState(client, client.CLOSED);

  expect(messages[1].type).toEqual("snapshotSaved");
  expect(messages[1].docId).toEqual(documentId);
  expect(messages[1].snapshotId).toEqual(snapshotId);

  expect(messages[2].type).toEqual("updateSaved");
  expect(messages[2].clock).toEqual(0);
  expect(messages[2].docId).toEqual(documentId);
  expect(messages[2].snapshotId).toEqual(snapshotId);
  expect(messages[2].serverVersion).toEqual(1);
  latestServerVersion = messages[1].serverVersion;
});
