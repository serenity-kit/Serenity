import { createSnapshot } from "@naisho/core";
import {
  decryptWorkspaceKey,
  deriveKeysFromKeyDerivationTrace,
  folderDerivedKeyContext,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import sodium, { KeyPair } from "react-native-libsodium";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocumentShareLink } from "../../../../test/helpers/document/createDocumentShareLink";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { getSnapshot } from "../../../../test/helpers/snapshot/getSnapshot";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = null;
let workspaceKey = "";
let snapshot: any = null;
let snapshotKey = "";
let sessionKey = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
  });
  const workspaceKeyBox =
    userData1.workspace.currentWorkspaceKey?.workspaceKeyBox;
  workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox?.ciphertext!,
    nonce: workspaceKeyBox?.nonce!,
    creatorDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
  });
  const snapshotKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: userData1.snapshot.keyDerivationTrace,
    activeDevice: userData1.mainDevice,
    workspaceKeyBox: userData1.workspace.currentWorkspaceKey.workspaceKeyBox,
  });
  const folderSubkeyId =
    snapshotKeyTrace.trace[snapshotKeyTrace.trace.length - 2].subkeyId;
  snapshotKey = snapshotKeyTrace.trace[snapshotKeyTrace.trace.length - 1].key;
  const snapshotSubkeyId =
    snapshotKeyTrace.trace[snapshotKeyTrace.trace.length - 1].subkeyId;
  sessionKey = userData1.sessionKey;

  const snapshotId = uuidv4();

  const keyDerivationTrace = {
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    trace: [
      {
        entryId: userData1.folder.id,
        parentId: null,
        subkeyId: folderSubkeyId,
        context: folderDerivedKeyContext,
      },
      {
        entryId: snapshotId,
        parentId: userData1.folder.id,
        subkeyId: snapshotSubkeyId,
        context: snapshotDerivedKeyContext,
      },
    ],
  };
  const signatureKeyPair: KeyPair = {
    publicKey: sodium.from_base64(userData1.webDevice!.signingPublicKey),
    privateKey: sodium.from_base64(userData1.webDevice!.signingPrivateKey),
    keyType: "ed25519",
  };
  const publicData = {
    snapshotId,
    docId: userData1.document.id,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    keyDerivationTrace,
    subkeyId: snapshotSubkeyId,
  };
  snapshot = createSnapshot(
    "CONTENT DUMMY",
    publicData,
    sodium.from_base64(snapshotKey),
    signatureKeyPair
  );
};
beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("retrieve a snapshot", async () => {
  const authorizationHeader = userData1.sessionKey;
  const result = await getSnapshot({
    graphql,
    documentId: userData1.document.id,
    authorizationHeader,
  });
  const snapshot = result.snapshot;
  expect(snapshot.id).toBe(userData1.snapshot.id);
  expect(snapshot.latestVersion).toBe(userData1.snapshot.latestVersion);
  expect(snapshot.data).toBe(userData1.snapshot.data);
  expect(snapshot.documentId).toBe(userData1.snapshot.documentId);
  expect(snapshot.keyDerivationTrace.workspaceKeyId).toBe(
    userData1.snapshot.keyDerivationTrace.workspaceKeyId
  );
  expect(snapshot.keyDerivationTrace.trace.length).toBe(
    userData1.snapshot.keyDerivationTrace.trace.length
  );
  expect(snapshot.keyDerivationTrace.trace[0].entityId).toBe(
    userData1.snapshot.keyDerivationTrace.trace[0].entityId
  );
  expect(snapshot.keyDerivationTrace.trace[0].parentId).toBe(
    userData1.snapshot.keyDerivationTrace.trace[0].parentId
  );
  expect(snapshot.keyDerivationTrace.trace[0].subkeyId).toBe(
    userData1.snapshot.keyDerivationTrace.trace[0].subkeyId
  );
  expect(snapshot.keyDerivationTrace.trace[0].context).toBe(
    userData1.snapshot.keyDerivationTrace.trace[0].context
  );
});

test("retrieve a snapshot from documentShareLinkToken", async () => {
  const authorizationHeader = userData1.sessionKey;
  const documentShareLinkResult = await createDocumentShareLink({
    graphql,
    documentId: userData1.document.id,
    sharingRole: Role.VIEWER,
    creatorDevice: userData1.webDevice,
    creatorDeviceEncryptionPrivateKey: userData1.webDevice.encryptionPrivateKey,
    snapshotKey,
    authorizationHeader: userData1.sessionKey,
  });
  const result = await getSnapshot({
    graphql,
    documentId: userData1.document.id,
    documentShareLinkToken:
      documentShareLinkResult.createDocumentShareLink.token,
    authorizationHeader,
  });
  const snapshot = result.snapshot;
  expect(snapshot.id).toBe(userData1.snapshot.id);
  expect(snapshot.latestVersion).toBe(userData1.snapshot.latestVersion);
  expect(snapshot.data).toBe(userData1.snapshot.data);
  expect(snapshot.documentId).toBe(userData1.snapshot.documentId);
  expect(snapshot.keyDerivationTrace.workspaceKeyId).toBe(
    userData1.snapshot.keyDerivationTrace.workspaceKeyId
  );
  expect(snapshot.keyDerivationTrace.trace.length).toBe(
    userData1.snapshot.keyDerivationTrace.trace.length
  );
  expect(snapshot.keyDerivationTrace.trace[0].entityId).toBe(
    userData1.snapshot.keyDerivationTrace.trace[0].entityId
  );
  expect(snapshot.keyDerivationTrace.trace[0].parentId).toBe(
    userData1.snapshot.keyDerivationTrace.trace[0].parentId
  );
  expect(snapshot.keyDerivationTrace.trace[0].subkeyId).toBe(
    userData1.snapshot.keyDerivationTrace.trace[0].subkeyId
  );
  expect(snapshot.keyDerivationTrace.trace[0].context).toBe(
    userData1.snapshot.keyDerivationTrace.trace[0].context
  );
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getSnapshot({
        graphql,
        documentId: uuidv4(),
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("Input Errors", async () => {
  await expect(
    (async () =>
      await getSnapshot({
        graphql,
        documentId: "",
        authorizationHeader: sessionKey,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});