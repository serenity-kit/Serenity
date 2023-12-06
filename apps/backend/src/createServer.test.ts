import {
  LocalDevice,
  SerenitySnapshotPublicData,
  createSnapshotKey,
  decryptWorkspaceKey,
  deriveSessionAuthorization,
  folderDerivedKeyContext,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import {
  SnapshotPublicData,
  createSnapshot,
  createUpdate,
} from "@serenity-tools/secsync";
import sodium, { KeyPair } from "react-native-libsodium";
import deleteAllRecords from "../test/helpers/deleteAllRecords";
import { createDocument } from "../test/helpers/document/createDocument";
import { getLastDocumentChainEventByDocumentId } from "../test/helpers/documentChain/getLastDocumentChainEventByDocumentId";
import setupGraphql from "../test/helpers/setupGraphql";
import {
  createSocketClient,
  waitForClientState,
} from "../test/helpers/websocket";
import { prisma } from "./database/prisma";
import { getSnapshot } from "./database/snapshot/getSnapshot";
import createUserWithWorkspace from "./database/testHelpers/createUserWithWorkspace";
import { getWorkspaceMemberDevicesProofByWorkspaceId } from "./database/workspace/getWorkspaceMemberDevicesProofByWorkspaceId";

const graphql = setupGraphql();
const username = "74176fce-8391-4f12-bbd5-d30a91e9ee7f@example.com";
let workspaceId = "";
let userId = "";
let documentId: string;
let webDevice: LocalDevice | null = null;
let sessionKey = "";
let workspaceKey = "";
let addedFolder: any = null;
let folderKey = "";
let addedWorkspace: any = null;
let snapshotId: string = "";
let lastSnapshotKey = "";

const setup = async () => {
  const result = await createUserWithWorkspace({
    username,
  });
  userId = result.user.id;
  workspaceId = result.workspace.id;
  webDevice = result.webDevice;
  sessionKey = result.sessionKey;
  addedWorkspace = result.workspace;
  const workspaceKeyBox = addedWorkspace.currentWorkspaceKey?.workspaceKeyBox;
  workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox?.ciphertext!,
    nonce: workspaceKeyBox?.nonce!,
    creatorDeviceEncryptionPublicKey: result.device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: result.encryptionPrivateKey,
    workspaceId,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey?.id!,
  });
  addedFolder = result.folder;
  const folderKeyResult = kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: addedFolder.subkeyId,
  });
  folderKey = folderKeyResult.key;

  const createDocumentResult = await createDocument({
    graphql,
    parentFolderId: addedFolder.id,
    workspaceId,
    activeDevice: result.webDevice,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
  });
  documentId = createDocumentResult.createDocument.id;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("document-error if no id is provided", async () => {
  const { client, messages } = await createSocketClient(graphql.port, "", 1);
  await waitForClientState(client, client.CLOSED);
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "type": "document-error",
      },
    ]
  `);
  expect(client.readyState).toEqual(client.CLOSED);
});

test("document-error if the document does not exist", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/id-that-does-not-exist`,
    1
  );
  await waitForClientState(client, client.CLOSED);
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "type": "document-error",
      },
    ]
  `);
  expect(client.readyState).toEqual(client.CLOSED);
});

test("document-error if no valid session key is provided", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}`,
    1
  );
  await waitForClientState(client, client.CLOSED);
  expect(messages).toMatchInlineSnapshot(`
    [
      {
        "type": "document-error",
      },
    ]
  `);
  expect(client.readyState).toEqual(client.CLOSED);
});

test("successfully retrieves a document", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${
      deriveSessionAuthorization({
        sessionKey,
      }).authorization
    }`,
    1
  );
  await waitForClientState(client, client.CLOSED);
  expect(messages[0].snapshot.publicData.docId).toBe(documentId);
  expect(messages[0].type).toEqual("document");
});

test("successfully creates a snapshot", async () => {
  const initialSnapshot = await getSnapshot({ documentId, userId });
  if (!initialSnapshot) throw new Error("No initial snapshot");

  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${
      deriveSessionAuthorization({
        sessionKey,
      }).authorization
    }`,
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
  const { state } = await getLastDocumentChainEventByDocumentId({ documentId });

  const workspaceMemberDevicesProofEntry =
    await getWorkspaceMemberDevicesProofByWorkspaceId({
      prisma,
      workspaceId,
    });

  const publicData: SnapshotPublicData & SerenitySnapshotPublicData = {
    snapshotId: id,
    docId: documentId,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    keyDerivationTrace,
    parentSnapshotId: initialSnapshot.id,
    parentSnapshotUpdateClocks: {},
    documentChainEventHash: state.eventHash,
    workspaceMemberDevicesProof: workspaceMemberDevicesProofEntry.proof,
  };
  const snapshot = createSnapshot(
    "CONTENT DUMMY",
    publicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair,
    initialSnapshot.ciphertextHash,
    initialSnapshot.parentSnapshotProof,
    sodium
  );
  snapshotId = snapshot.publicData.snapshotId;
  client.send(
    JSON.stringify({
      ...snapshot,
    })
  );

  await waitForClientState(client, client.CLOSED);
  expect(messages[1].type).toEqual("snapshot-saved");
  expect(messages[1].snapshotId).toEqual(snapshotId);
});

test("successfully creates an update", async () => {
  const { client, messages } = await createSocketClient(
    graphql.port,
    `/${documentId}?sessionKey=${
      deriveSessionAuthorization({
        sessionKey,
      }).authorization
    }`,
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

  expect(messages[1].type).toEqual("update-saved");
  expect(messages[1].clock).toEqual(0);
  expect(messages[1].snapshotId).toEqual(snapshotId);
});
