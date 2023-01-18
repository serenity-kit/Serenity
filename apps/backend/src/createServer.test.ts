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
import createUserWithWorkspace from "./database/testHelpers/createUserWithWorkspace";
import { Device } from "./types/device";

let server;

const graphql = setupGraphql();
const username = "74176fce-8391-4f12-bbd5-d30a91e9ee7f@example.com";
const workspaceId = "5237c256-e078-4aa5-a7b1-8e6559698769";
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
    id: workspaceId,
    username,
  });
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

test("document not found if no id is provided", async () => {
  const { client, messages } = await createSocketClient(graphql.port, "", 1);
  await waitForClientState(client, client.CLOSED);
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "type": "documentNotFound",
      },
    ]
  `);
  expect(client.readyState).toEqual(client.CLOSED);
});

test("document not found if the document does not exist", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/id-that-does-not-exist`,
    1
  );
  await waitForClientState(client, client.CLOSED);
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "type": "documentNotFound",
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
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "doc": {
          "id": "10f99b10-62a3-427f-9928-c1e0b32648e2",
          "parentFolderId": null,
          "workspaceId": "5237c256-e078-4aa5-a7b1-8e6559698769",
          "workspaceKeyId": null,
        },
        "parentFolder": {},
        "snapshot": null,
        "type": "document",
        "updates": [],
      },
    ]
  `);
});

test("successfully creates a snapshot", async () => {
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
    snapshotId: "5ef62cbf-3c0e-4cf7-bf6e-f4d578f4855b",
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
