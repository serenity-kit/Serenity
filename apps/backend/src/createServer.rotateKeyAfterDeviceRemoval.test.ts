import { createSnapshot, createUpdate } from "@naisho/core";
import {
  createSnapshotKey,
  encryptWorkspaceKeyForDevice,
  folderDerivedKeyContext,
  LocalDevice,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import sodium, { KeyPair } from "react-native-libsodium";
import deleteAllRecords from "../test/helpers/deleteAllRecords";
import { decryptWorkspaceKey } from "../test/helpers/device/decryptWorkspaceKey";
import { deleteDevices } from "../test/helpers/device/deleteDevices";
import { createDocument } from "../test/helpers/document/createDocument";
import setupGraphql from "../test/helpers/setupGraphql";
import {
  createSocketClient,
  waitForClientState,
} from "../test/helpers/websocket";
import { getWorkspace } from "../test/helpers/workspace/getWorkspace";
import { createDeviceAndLogin } from "./database/testHelpers/createDeviceAndLogin";
import createUserWithWorkspace from "./database/testHelpers/createUserWithWorkspace";
import { Device } from "./types/device";
import { WorkspaceWithWorkspaceDevicesParing } from "./types/workspaceDevice";

let server;

const graphql = setupGraphql();
const username = "f6ac741d-73ba-4f83-84cc-211a750ca775@example.com";
const workspaceId = "64968c7d-cdb3-4844-a029-b0052af7bfc5";
const documentId = "160e9589-2a32-437a-ab88-be8756a4edab";
let userId: string | null = null;
let device: Device | null = null;
let webDevice: LocalDevice | null = null;
let webDevice2: LocalDevice | null = null;
let sessionKey = "";
let workspaceKey = "";
let addedFolder: any = null;
let folderKey = "";
let addedWorkspace: any = null;
let snapshotId: string = "";
let latestServerVersion = null;
let encryptionPrivateKey = "";
let lastSnapshotKey = "";

const setup = async () => {
  const userAndWorkspaceData = await createUserWithWorkspace({
    id: workspaceId,
    username,
  });
  userId = userAndWorkspaceData.user.id;
  device = userAndWorkspaceData.device;
  webDevice = userAndWorkspaceData.webDevice;
  sessionKey = userAndWorkspaceData.sessionKey;
  addedWorkspace = userAndWorkspaceData.workspace;
  encryptionPrivateKey = userAndWorkspaceData.encryptionPrivateKey;
  const workspaceKeyBox = addedWorkspace.currentWorkspaceKey?.workspaceKeyBox;
  workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox?.ciphertext!,
    nonce: workspaceKeyBox?.nonce!,
    creatorDeviceEncryptionPublicKey:
      userAndWorkspaceData.device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey:
      userAndWorkspaceData.encryptionPrivateKey,
  });
  addedFolder = userAndWorkspaceData.folder;
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
    authorizationHeader: sessionKey,
  });

  const loginResult = await createDeviceAndLogin({
    username: userAndWorkspaceData.user.username,
    password: "12345689",
    envelope: userAndWorkspaceData.envelope,
  });
  webDevice2 = loginResult.webDevice;
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

  const snapshotKey = createSnapshotKey({ folderKey });
  lastSnapshotKey = snapshotKey.key;
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
    snapshotId: "3e9fc49b-d239-45c3-8d33-932d347c331a",
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    keyDerivationTrace,
    subkeyId: snapshotKey.subkeyId,
  };
  const snapshot = createSnapshot(
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

test("delete a device", async () => {
  const authorizationHeader = sessionKey;

  const workspaceKeyBox1 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: device!.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
    workspaceKey,
  });
  const workspaceKeyBox2 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: webDevice!.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
    workspaceKey,
  });
  const newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[] = [
    {
      id: workspaceId,
      workspaceDevices: [
        {
          receiverDeviceSigningPublicKey: device!.signingPublicKey,
          ciphertext: workspaceKeyBox1.ciphertext,
          nonce: workspaceKeyBox1.nonce,
        },
        {
          receiverDeviceSigningPublicKey: webDevice!.signingPublicKey,
          ciphertext: workspaceKeyBox2.ciphertext,
          nonce: workspaceKeyBox2.nonce,
        },
      ],
    },
  ];
  // device should exist
  const response = await deleteDevices({
    graphql,
    creatorSigningPublicKey: device!.signingPublicKey,
    newDeviceWorkspaceKeyBoxes,
    deviceSigningPublicKeysToBeDeleted: [webDevice2!.signingPublicKey],
    authorizationHeader,
  });
  expect(response.deleteDevices.status).toBe("success");
});

test("document update will fail", async () => {
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

test("snapshot based on old workspace key fails", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${sessionKey}`,
    2
  );

  await waitForClientState(client, client.OPEN);

  const snapshotKey = createSnapshotKey({ folderKey });
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
  const snapshot = createSnapshot(
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

  await waitForClientState(client, client.CLOSED);

  expect(messages[1].type).toEqual("snapshotFailed");
});

test("successfully creates a snapshot", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${sessionKey}`,
    2
  );

  await waitForClientState(client, client.OPEN);

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
    snapshotId: "a5ebe3cc-c304-41f4-9c73-5903c06e7a6f",
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    keyDerivationTrace,
    subkeyId: snapshotKey.subkeyId,
  };
  const snapshot = createSnapshot(
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
