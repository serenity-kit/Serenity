import { createInitialSnapshot, createUpdate } from "@naisho/core";
import {
  LocalDevice,
  createSnapshotKey,
  decryptWorkspaceKey,
  folderDerivedKeyContext,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import sodium, { KeyPair } from "react-native-libsodium";
import deleteAllRecords from "../test/helpers/deleteAllRecords";
import { createDocument } from "../test/helpers/document/createDocument";
import setupGraphql from "../test/helpers/setupGraphql";
import {
  createSocketClient,
  waitForClientState,
} from "../test/helpers/websocket";
import createUserWithWorkspace from "./database/testHelpers/createUserWithWorkspace";
import { Device } from "./types/device";

let server;

const graphql = setupGraphql();
const username = "74176fce-8391-4f12-bbd5-d30a91e9ee7f@example.com";
let workspaceId = "";
const documentId = "10f99b10-62a3-427f-9928-c1e0b32648e2";
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
let lastSnapshotKey = "";

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

test("unauthorized if no id is provided", async () => {
  const { client, messages } = await createSocketClient(graphql.port, "", 1);
  await waitForClientState(client, client.CLOSED);
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "type": "unauthorized",
      },
    ]
  `);
  expect(client.readyState).toEqual(client.CLOSED);
});

test("unauthorized if the document does not exist", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/id-that-does-not-exist`,
    1
  );
  await waitForClientState(client, client.CLOSED);
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "type": "unauthorized",
      },
    ]
  `);
  expect(client.readyState).toEqual(client.CLOSED);
});

test("unauthorized if no valid session key is provided", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}`,
    1
  );
  await waitForClientState(client, client.CLOSED);
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "type": "unauthorized",
      },
    ]
  `);
  expect(client.readyState).toEqual(client.CLOSED);
});

test("successfully retrieves a document", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${sessionKey}`,
    1
  );
  await waitForClientState(client, client.CLOSED);
  expect(messages[0].doc.id).toEqual(documentId);
  expect(messages[0].doc.parentFolderId).toEqual(addedFolder.id);
  expect(messages[0].doc.workspaceId).toEqual(workspaceId);
  expect(messages[0].snapshot.publicData.docId).toBe(documentId);
  expect(messages[0].type).toEqual("document");
});

test("successfully creates a snapshot", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${sessionKey}`,
    2
  );

  await waitForClientState(client, client.OPEN);
  const id = "5ef62cbf-3c0e-4cf7-bf6e-f4d578f4855b";
  const snapshotKey = createSnapshotKey({ folderKey });
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
  const snapshot = createInitialSnapshot(
    "CONTENT DUMMY",
    publicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair,
    sodium
  );
  snapshotId = snapshot.publicData.snapshotId;
  client.send(
    JSON.stringify({
      ...snapshot,
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

  const snapshotKey = createSnapshotKey({ folderKey });
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
    sodium.from_base64(snapshotKey.key),
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
