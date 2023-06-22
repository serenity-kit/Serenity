import {
  createSnapshotKey,
  decryptWorkspaceKey,
  folderDerivedKeyContext,
  LocalDevice,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import {
  createInitialSnapshot,
  createSnapshot,
  createUpdate,
  Snapshot,
} from "@serenity-tools/secsync";
import sodium, { KeyPair } from "react-native-libsodium";
import deleteAllRecords from "../test/helpers/deleteAllRecords";
import { createDocument } from "../test/helpers/document/createDocument";
import setupGraphql from "../test/helpers/setupGraphql";
import {
  createSocketClient,
  waitForClientState,
} from "../test/helpers/websocket";
import { getWorkspace } from "../test/helpers/workspace/getWorkspace";
import { prisma } from "./database/prisma";
import createUserWithWorkspace from "./database/testHelpers/createUserWithWorkspace";
import { Device } from "./types/device";

let server;

const graphql = setupGraphql();
const username = "59f80f08-c065-4acc-a542-2725fb2dff6c@example.com";
let workspaceId = "";
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
let encryptionPrivateKey = "";
let lastSnapshotKey = "";
let firstSnapshot: Snapshot;

const setup = async () => {
  const result = await createUserWithWorkspace({
    username,
  });
  workspaceId = result.workspace.id;
  userId = result.user.id;
  device = result.device;
  webDevice = result.webDevice;
  sessionKey = result.sessionKey;
  addedWorkspace = result.workspace;
  encryptionPrivateKey = result.encryptionPrivateKey;
  const workspaceKeyBox = addedWorkspace.currentWorkspaceKey?.workspaceKeyBox;
  workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox?.ciphertext!,
    nonce: workspaceKeyBox?.nonce!,
    creatorDeviceEncryptionPublicKey: result.device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: result.encryptionPrivateKey,
  });
  addedFolder = result.folder;
  const folderKeyResult = kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: addedFolder.subkeyId,
  });
  folderKey = folderKeyResult.key;

  const createDocumentResponse = await createDocument({
    graphql,
    id: documentId,
    parentFolderId: addedFolder.id,
    workspaceId,
    activeDevice: result.webDevice,
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
  const id = "be0fa80f-4c6b-47f9-b2d4-ac1cc9f3e31b";
  const snapshotKey = createSnapshotKey({ folderKey });
  lastSnapshotKey = snapshotKey.key;
  const keyDerivationTrace = {
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    trace: [
      {
        entryId: addedFolder.id,
        parentId: null,
        subkeyId: addedFolder.subkeyId,
        context: folderDerivedKeyContext,
      },
      {
        entryId: id,
        parentId: addedFolder.id,
        subkeyId: snapshotKey.subkeyId,
        context: snapshotDerivedKeyContext,
      },
    ],
  };
  const signatureKeyPair: KeyPair = {
    publicKey: sodium.from_base64(webDevice!.signingPublicKey),
    privateKey: sodium.from_base64(webDevice!.signingPrivateKey),
    keyType: "ed25519",
  };
  const publicData = {
    snapshotId: id,
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    keyDerivationTrace,
    subkeyId: snapshotKey.subkeyId,
    parentSnapshotClocks: {},
  };
  firstSnapshot = createInitialSnapshot(
    "CONTENT DUMMY",
    publicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair,
    sodium
  );
  snapshotId = firstSnapshot.publicData.snapshotId;
  client.send(
    JSON.stringify({
      ...firstSnapshot,
      latestServerVersion,
    })
  );

  await waitForClientState(client, client.CLOSED);
  expect(messages[1].type).toEqual("snapshotSaved");
  expect(messages[1].snapshotId).toEqual(snapshotId);
});

test("successfully creates an update", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${sessionKey}`,
    2
  );

  await waitForClientState(client, client.OPEN);

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
  const updateToSend = createUpdate(
    "UPDATE CONTENT DUMMY",
    publicData,
    sodium.from_base64(lastSnapshotKey),
    signatureKeyPair,
    0,
    sodium
  );

  client.send(JSON.stringify(updateToSend));

  await waitForClientState(client, client.CLOSED);
  expect(messages[1].type).toEqual("updateSaved");
  expect(messages[1].clock).toEqual(0);
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
  const updateToSend = createUpdate(
    "UPDATE CONTENT DUMMY",
    publicData,
    sodium.from_base64(lastSnapshotKey),
    signatureKeyPair,
    1,
    sodium
  );

  client.send(JSON.stringify(updateToSend));

  await waitForClientState(client, client.CLOSED);
  expect(messages[1].type).toEqual("updateFailed");
  expect(messages[1].clock).toEqual(1);
  expect(messages[1].requiresNewSnapshot).toBe(true);
  expect(messages[1].snapshotId).toEqual(snapshotId);
});

test("successfully creates a snapshot", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${sessionKey}`,
    2
  );

  await waitForClientState(client, client.OPEN);
  const id = "9674b24a-bb14-4f7e-bc81-dd49906a28fd";
  const workspaceResult = await getWorkspace({
    graphql,
    workspaceId,
    authorizationHeader: sessionKey,
    deviceSigningPublicKey: device!.signingPublicKey,
  });

  const workspaceKeyBox =
    workspaceResult.workspace.currentWorkspaceKey.workspaceKeyBox;

  workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey:
      workspaceKeyBox.creatorDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: encryptionPrivateKey,
  });
  const folderKeyResult = kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: addedFolder.subkeyId,
  });
  folderKey = folderKeyResult.key;

  const snapshotKey = createSnapshotKey({ folderKey });
  lastSnapshotKey = snapshotKey.key;
  const keyDerivationTrace = {
    workspaceKeyId: workspaceResult.workspace.currentWorkspaceKey.id,
    trace: [
      {
        entryId: addedFolder.id,
        parentId: null,
        subkeyId: addedFolder.subkeyId,
        context: folderDerivedKeyContext,
      },
      {
        entryId: id,
        parentId: addedFolder.id,
        subkeyId: snapshotKey.subkeyId,
        context: snapshotDerivedKeyContext,
      },
    ],
  };
  const signatureKeyPair: KeyPair = {
    publicKey: sodium.from_base64(webDevice!.signingPublicKey),
    privateKey: sodium.from_base64(webDevice!.signingPrivateKey),
    keyType: "ed25519",
  };
  const publicData = {
    snapshotId: id,
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    keyDerivationTrace,
    subkeyId: snapshotKey.subkeyId,
    parentSnapshotClocks: {},
  };
  const snapshot = createSnapshot(
    "CONTENT DUMMY",
    publicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair,
    firstSnapshot.ciphertext,
    firstSnapshot.publicData.parentSnapshotProof,
    sodium
  );
  client.send(
    JSON.stringify({
      ...snapshot,
      lastKnownSnapshotId: snapshotId,
      latestServerVersion,
    })
  );
  snapshotId = snapshot.publicData.snapshotId;

  await waitForClientState(client, client.CLOSED);

  expect(messages[1].type).toEqual("snapshotSaved");
  expect(messages[1].snapshotId).toEqual(snapshotId);
});

test("successfully creates an update", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${sessionKey}`,
    2
  );

  await waitForClientState(client, client.OPEN);

  const signatureKeyPair: KeyPair = {
    publicKey: sodium.from_base64(webDevice!.signingPublicKey),
    privateKey: sodium.from_base64(webDevice!.signingPrivateKey),
    keyType: "ed25519",
  };

  const updatePublicData = {
    refSnapshotId: snapshotId,
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
  };
  const updateToSend = createUpdate(
    "UPDATE CONTENT DUMMY",
    updatePublicData,
    sodium.from_base64(lastSnapshotKey),
    signatureKeyPair,
    0,
    sodium
  );

  client.send(JSON.stringify(updateToSend));

  await waitForClientState(client, client.CLOSED);

  expect(messages[1].type).toEqual("updateSaved");
  expect(messages[1].clock).toEqual(0);
  expect(messages[1].snapshotId).toEqual(snapshotId);
  expect(messages[1].serverVersion).toEqual(1);
  latestServerVersion = messages[1].serverVersion;
});
