import {
  createSnapshotKey,
  decryptWorkspaceKey,
  deriveSessionAuthorization,
  encryptWorkspaceKeyForDevice,
  folderDerivedKeyContext,
  generateId,
  LocalDevice,
  SerenitySnapshotPublicData,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import {
  createSnapshot,
  createUpdate,
  hash,
  Snapshot,
  SnapshotPublicData,
} from "@serenity-tools/secsync";
import sodium, { KeyPair } from "react-native-libsodium";
import deleteAllRecords from "../test/helpers/deleteAllRecords";
import { deleteDevice } from "../test/helpers/device/deleteDevice";
import { createDocument } from "../test/helpers/document/createDocument";
import { getLastDocumentChainEventByDocumentId } from "../test/helpers/documentChain/getLastDocumentChainEventByDocumentId";
import setupGraphql from "../test/helpers/setupGraphql";
import {
  createSocketClient,
  waitForClientState,
} from "../test/helpers/websocket";
import { getWorkspace } from "../test/helpers/workspace/getWorkspace";
import { prisma } from "./database/prisma";
import { getSnapshot } from "./database/snapshot/getSnapshot";
import { createDeviceAndLogin } from "./database/testHelpers/createDeviceAndLogin";
import createUserWithWorkspace from "./database/testHelpers/createUserWithWorkspace";
import { getWorkspaceMemberDevicesProofByWorkspaceId } from "./database/workspace/getWorkspaceMemberDevicesProofByWorkspaceId";
import { Device } from "./types/device";
import { WorkspaceWithWorkspaceDevicesParing } from "./types/workspaceDevice";

let server;

const graphql = setupGraphql();
const username = "f6ac741d-73ba-4f83-84cc-211a750ca775@example.com";
let workspaceId = "";
let documentId: string;
let userId: string = "";
let device: Device | null = null;
let webDevice: LocalDevice | null = null;
let webDevice2: LocalDevice | null = null;
let sessionKey = "";
let workspaceKey = "";
let addedFolder: any = null;
let folderKey = "";
let addedWorkspace: any = null;
let snapshotId: string = "";
let encryptionPrivateKey = "";
let lastSnapshotKey = "";
let initialSnapshot: unknown = null;
let firstSnapshot: Snapshot;
let secondSnapshot: Snapshot;
let userAndWorkspaceData: any = null;

const setup = async () => {
  userAndWorkspaceData = await createUserWithWorkspace({
    username,
  });
  workspaceId = userAndWorkspaceData.workspace.id;
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
    workspaceId,
    workspaceKeyId: userAndWorkspaceData.workspace.currentWorkspaceKey.id,
  });
  addedFolder = userAndWorkspaceData.folder;
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
    activeDevice: userAndWorkspaceData.webDevice,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
  });
  documentId = createDocumentResult.createDocument.id;

  const loginResult = await createDeviceAndLogin({
    username: userAndWorkspaceData.user.username,
    password: "12345689",
    envelope: userAndWorkspaceData.envelope,
    mainDevice: userAndWorkspaceData.mainDevice,
  });
  webDevice2 = loginResult.webDevice;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
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
  const id = "3e9fc49b-d239-45c3-8d33-932d347c331a";
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
    documentChainEventHash: state.eventHash,
    parentSnapshotId: initialSnapshot.id,
    parentSnapshotUpdateClocks: {},
    workspaceMemberDevicesProof: workspaceMemberDevicesProofEntry.proof,
  };
  firstSnapshot = createSnapshot(
    "CONTENT DUMMY",
    publicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair,
    initialSnapshot.ciphertextHash,
    initialSnapshot.parentSnapshotProof,
    sodium
  );
  snapshotId = firstSnapshot.publicData.snapshotId;
  client.send(
    JSON.stringify({
      ...firstSnapshot,
      lastKnownSnapshotId: undefined,
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
  expect(messages[1].type).toEqual("update-saved");
  expect(messages[1].clock).toEqual(0);
});

test("delete a device", async () => {
  const authorizationHeader = deriveSessionAuthorization({
    sessionKey,
  }).authorization;

  const newWorkspaceKey = {
    id: generateId(),
    workspaceKey: sodium.to_base64(sodium.crypto_kdf_keygen()),
  };

  const workspaceKeyBox1 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: device!.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
    workspaceId,
    workspaceKey: newWorkspaceKey.workspaceKey,
    workspaceKeyId: newWorkspaceKey.id,
  });
  const workspaceKeyBox2 = encryptWorkspaceKeyForDevice({
    receiverDeviceEncryptionPublicKey: webDevice!.encryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: encryptionPrivateKey,
    workspaceId,
    workspaceKey: newWorkspaceKey.workspaceKey,
    workspaceKeyId: newWorkspaceKey.id,
  });
  const newDeviceWorkspaceKeyBoxes: WorkspaceWithWorkspaceDevicesParing[] = [
    {
      id: workspaceId,
      workspaceKeyId: newWorkspaceKey.id,
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
  const response = await deleteDevice({
    graphql,
    creatorSigningPublicKey: device!.signingPublicKey,
    newDeviceWorkspaceKeyBoxes,
    deviceSigningPublicKeyToBeDeleted: webDevice2!.signingPublicKey,
    authorizationHeader,
    mainDevice: userAndWorkspaceData.mainDevice,
  });
  expect(response.deleteDevice.status).toBe("success");
});

test("document update will fail", async () => {
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
  expect(messages[1].type).toEqual("update-save-failed");
  expect(messages[1].clock).toEqual(1);
  expect(messages[1].requiresNewSnapshot).toBe(true);
  expect(messages[1].snapshotId).toEqual(snapshotId);
});

test("snapshot based on old workspace key fails", async () => {
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
  const id = "9674b24a-bb14-4f7e-bc81-dd49906a28fd";
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
    documentChainEventHash: state.eventHash,
    parentSnapshotId: firstSnapshot.publicData.snapshotId,
    parentSnapshotUpdateClocks: {},
    workspaceMemberDevicesProof: workspaceMemberDevicesProofEntry.proof,
  };
  secondSnapshot = createSnapshot(
    "CONTENT DUMMY",
    publicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair,
    hash(firstSnapshot.ciphertext, sodium),
    firstSnapshot.publicData.parentSnapshotProof,
    sodium
  );
  client.send(
    JSON.stringify({
      ...secondSnapshot,
      lastKnownSnapshotId: snapshotId,
    })
  );

  await waitForClientState(client, client.CLOSED);

  expect(messages[1].type).toEqual("snapshot-save-failed");
});

test("successfully creates a snapshot", async () => {
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
  const id = "a5ebe3cc-c304-41f4-9c73-5903c06e7a6f";
  const workspaceResult = await getWorkspace({
    graphql,
    workspaceId,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
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
    workspaceId,
    workspaceKeyId: workspaceResult.workspace.currentWorkspaceKey.id,
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
    documentChainEventHash: state.eventHash,
    parentSnapshotId: firstSnapshot.publicData.snapshotId,
    parentSnapshotUpdateClocks: {
      [webDevice!.signingPublicKey]: 0,
    },
    workspaceMemberDevicesProof: workspaceMemberDevicesProofEntry.proof,
  };
  const snapshot = createSnapshot(
    "CONTENT DUMMY",
    publicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair,
    hash(firstSnapshot.ciphertext, sodium),
    firstSnapshot.publicData.parentSnapshotProof,
    sodium
  );
  client.send(
    JSON.stringify({
      ...snapshot,
      lastKnownSnapshotId: snapshotId,
    })
  );
  snapshotId = snapshot.publicData.snapshotId;

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

  expect(messages[1].type).toEqual("update-saved");
  expect(messages[1].clock).toEqual(0);
  expect(messages[1].snapshotId).toEqual(snapshotId);
});
