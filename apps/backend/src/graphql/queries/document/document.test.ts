import {
  decryptWorkspaceKey,
  deriveKeysFromKeyDerivationTrace,
  deriveSessionAuthorization,
  generateId,
} from "@serenity-tools/common";
import { decryptDocumentTitleBasedOnSnapshotKey } from "@serenity-tools/common/src/decryptDocumentTitleBasedOnSnapshotKey/decryptDocumentTitleBasedOnSnapshotKey";
import { prisma } from "../../../../src/database/prisma";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { getDocument } from "../../../../test/helpers/document/getDocument";
import { updateDocumentName } from "../../../../test/helpers/document/updateDocumentName";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { getSnapshot } from "../../../../test/helpers/snapshot/getSnapshot";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getWorkspaceMemberDevicesProof } from "../../../database/workspace/getWorkspaceMemberDevicesProof";

const graphql = setupGraphql();
let userData1: any = null;
let workspaceKey = "";
let snapshotKey = "";
let sessionKey = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
  });
  const workspaceKeyBox =
    userData1.workspace.currentWorkspaceKey?.workspaceKeyBox;
  workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox?.ciphertext!,
    nonce: workspaceKeyBox?.nonce!,
    creatorDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  const snapshotKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: userData1.snapshot.publicData.keyDerivationTrace,
    activeDevice: userData1.mainDevice,
    workspaceKeyBox: userData1.workspace.currentWorkspaceKey.workspaceKeyBox,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  snapshotKey = snapshotKeyTrace.trace[snapshotKeyTrace.trace.length - 1].key;
  sessionKey = userData1.sessionKey;
};
beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be retrieve a document", async () => {
  const authorizationHeader = deriveSessionAuthorization({
    sessionKey: userData1.sessionKey,
  }).authorization;
  const documentName = "Test document";
  const createDocumentResponse = await createDocument({
    graphql,
    parentFolderId: userData1.folder.id,
    workspaceId: userData1.workspace.id,
    activeDevice: userData1.webDevice,
    authorizationHeader,
  });
  const documentId = createDocumentResponse.createDocument.id;
  await updateDocumentName({
    graphql,
    id: documentId,
    name: documentName,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    activeDevice: userData1.webDevice,
    authorizationHeader,
  });

  // const createdDocument = createDocumentResponse.createDevice.document;

  const result = await getDocument({
    graphql,
    id: documentId,
    authorizationHeader,
  });
  const retrievedDocument = result.document;
  expect(retrievedDocument.id).toBe(documentId);
  expect(retrievedDocument.workspaceId).toBe(userData1.workspace.id);
  expect(retrievedDocument.parentFolderId).toBe(userData1.folder.id);
  expect(typeof retrievedDocument.nameCiphertext).toBe("string");
  expect(typeof retrievedDocument.nameNonce).toBe("string");
  expect(typeof retrievedDocument.subkeyId).toBe("string");

  const snapshotResult = await getSnapshot({
    graphql,
    documentId,
    authorizationHeader,
  });
  const snapshot = snapshotResult.snapshot;
  const snapshotKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: snapshot.keyDerivationTrace,
    activeDevice: userData1.mainDevice,
    workspaceKeyBox: userData1.workspace.currentWorkspaceKey.workspaceKeyBox,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
  });
  const snapshotKey =
    snapshotKeyTrace.trace[snapshotKeyTrace.trace.length - 1].key;

  const documentNameWorkspaceMemberDevicesProof =
    await getWorkspaceMemberDevicesProof({
      userId: userData1.user.id,
      workspaceId: userData1.workspace.id,
      hash: retrievedDocument.nameWorkspaceMemberDevicesProofHash,
      prisma,
    });

  const decryptedName = decryptDocumentTitleBasedOnSnapshotKey({
    ciphertext: retrievedDocument.nameCiphertext,
    nonce: retrievedDocument.nameNonce,
    snapshotKey,
    subkeyId: retrievedDocument.subkeyId,
    documentId: retrievedDocument.id,
    workspaceId: retrievedDocument.workspaceId,
    workspaceMemberDevicesProof: documentNameWorkspaceMemberDevicesProof.proof,
    signature: retrievedDocument.nameSignature,
    creatorDeviceSigningPublicKey:
      retrievedDocument.nameCreatorDeviceSigningPublicKey,
  });
  expect(decryptedName).toBe(documentName);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getDocument({
        graphql,
        id: generateId(),
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

test("Input Errors", async () => {
  await expect(
    (async () =>
      await getDocument({
        graphql,
        id: "",
        authorizationHeader: deriveSessionAuthorization({ sessionKey })
          .authorization,
      }))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});
