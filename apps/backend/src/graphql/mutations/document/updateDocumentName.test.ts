import {
  decryptDocumentTitle,
  decryptWorkspaceKey,
  deriveKeysFromKeyDerivationTrace,
  folderDerivedKeyContext,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { updateDocumentName } from "../../../../test/helpers/document/updateDocumentName";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { getSnapshot } from "../../../../test/helpers/snapshot/getSnapshot";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
const password = "password";
let addedWorkspace: any = null;
let addedFolder: any = null;
let addedDocumentId = "";
let addedDocumentSnapshot: any = null;
let sessionKey = "";
let workspaceKey = "";
let folderKey = "";
let snapshotKey = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  addedWorkspace = userData1.workspace;
  sessionKey = userData1.sessionKey;
  addedFolder = userData1.folder;

  const workspaceKeyBox = addedWorkspace.currentWorkspaceKey.workspaceKeyBox;
  workspaceKey = decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
  });
  const folderKeyResult = kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: addedFolder.keyDerivationTrace.subkeyId,
  });
  folderKey = folderKeyResult.key;
  const createDocumentResult = await createDocument({
    graphql,
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    parentFolderId: addedFolder.id,
    workspaceId: addedWorkspace.id,
    activeDevice: userData1.webDevice,
    authorizationHeader: sessionKey,
  });
  addedDocumentId = createDocumentResult.createDocument.id;
  const snapshotResult = await getSnapshot({
    graphql,
    documentId: addedDocumentId,
    authorizationHeader: sessionKey,
  });
  addedDocumentSnapshot = snapshotResult.snapshot;
  const snapshotKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: addedDocumentSnapshot.keyDerivationTrace,
    activeDevice: userData1.mainDevice,
    workspaceKeyBox: userData1.workspace.currentWorkspaceKey.workspaceKeyBox,
  });
  snapshotKey = snapshotKeyTrace.trace[snapshotKeyTrace.trace.length - 1].key;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to change a document name", async () => {
  const authorizationHeader = sessionKey;
  const id = addedDocumentId;
  const name = "Updated Name";
  const result = await updateDocumentName({
    graphql,
    id,
    name,
    activeDevice: userData1.webDevice,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    authorizationHeader,
  });
  const updatedDocument = result.updateDocumentName.document;
  expect(typeof updatedDocument.nameCiphertext).toBe("string");
  expect(typeof updatedDocument.nameNonce).toBe("string");
  const documentSubkey = recreateDocumentKey({
    snapshotKey,
    subkeyId: updatedDocument.subkeyId,
  });

  const decryptedName = decryptDocumentTitle({
    key: documentSubkey.key,
    ciphertext: updatedDocument.nameCiphertext,
    publicNonce: updatedDocument.nameNonce,
    publicData: null,
  });
  expect(decryptedName).toBe(name);
});

test("Throw error when document doesn't exist", async () => {
  const authorizationHeader = sessionKey;
  const id = "badthing";
  const name = "Doesn't Exist Name";
  await expect(
    (async () =>
      await updateDocumentName({
        graphql,
        id,
        name,
        activeDevice: userData1.webDevice,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("Throw error when user doesn't have access", async () => {
  const userData2 = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });

  const otherUserDocumentResult = await createDocument({
    graphql,
    id: "97a4c517-5ef2-4ea8-ac40-86a1e182bf23",
    parentFolderId: userData1.folder.id,
    workspaceId: userData1.workspace.id,
    activeDevice: userData1.webDevice,
    authorizationHeader: userData1.sessionKey,
  });
  const id = otherUserDocumentResult.createDocument.id;
  const name = "Unauthorized Name";
  await expect(
    (async () =>
      await updateDocumentName({
        graphql,
        id,
        name,
        activeDevice: userData1.webDevice,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader: userData2.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Commenter tries to update", async () => {
  const otherUser = await registerUser(
    graphql,
    `${uuidv4()}@example.com`,
    password
  );
  await prisma.usersToWorkspaces.create({
    data: {
      userId: otherUser.userId,
      workspaceId: addedWorkspace.id,
      role: Role.COMMENTER,
    },
  });
  const id = addedDocumentId;
  const name = "Updated Name";
  await expect(
    (async () =>
      await updateDocumentName({
        graphql,
        id,
        name,
        activeDevice: userData1.webDevice,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader: otherUser.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Viewer tries to update", async () => {
  const otherUser = await registerUser(
    graphql,
    `${uuidv4()}@example.com`,
    password
  );
  await prisma.usersToWorkspaces.create({
    data: {
      userId: otherUser.userId,
      workspaceId: addedWorkspace.id,
      role: Role.VIEWER,
    },
  });
  const id = addedDocumentId;
  const name = "Updated Name";
  await expect(
    (async () =>
      await updateDocumentName({
        graphql,
        id,
        name,
        activeDevice: userData1.webDevice,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader: otherUser.sessionKey,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  const id = addedDocumentId;
  const name = "Updated Name";
  await expect(
    (async () =>
      await updateDocumentName({
        graphql,
        id,
        name,
        activeDevice: userData1.webDevice,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };
  const id = uuidv4();
  test("Invalid Id", async () => {
    const query = gql`
      mutation {
        updateDocumentName(
          input: { id: 2, nameCiphertext: "", nameNonce: "", subkeyId: 1 }
        ) {
          document {
            id
          }
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
  test("Invalid name", async () => {
    const query = gql`
        mutation {
            updateDocumentName(
            input: {
              id: "${id}"
              nameCiphertext: null
              nameNonce: null
              subkeyId: 1
            }
          ) {
            document {
              id
            }
          }
        }
      `;
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
  test("Invalid subkeyId", async () => {
    const query = gql`
      mutation {
        updateDocumentName(
          input: {
            id: ""
            nameCiphertext: "abc123"
            nameNonce: "abc123"
            subkeyId: "lala"
          }
        ) {
          document {
            id
          }
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
  test("Invalid input", async () => {
    const query = gql`
      mutation {
        updateDocumentName(input: null) {
          document {
            id
          }
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
});
