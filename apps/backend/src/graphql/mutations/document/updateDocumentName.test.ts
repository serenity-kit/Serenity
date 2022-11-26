import {
  createDocumentKey,
  decryptDocumentTitle,
  folderDerivedKeyContext,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../../prisma/generated/output";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { decryptWorkspaceKey } from "../../../../test/helpers/device/decryptWorkspaceKey";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { updateDocumentName } from "../../../../test/helpers/document/updateDocumentName";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
const username = "user1";
const password = "password";
let addedWorkspace: any = null;
let addedFolder: any = null;
let addedDocumentId = "";
let sessionKey = "";
let workspaceKey = "";
let folderKey = "";

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
  workspaceKey = await decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey: userData1.device.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
  });
  const folderKeyResult = await kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: addedFolder.keyDerivationTrace.subkeyId,
  });
  folderKey = folderKeyResult.key;
  let documentContentKeyResult = await createDocumentKey({
    folderKey,
  });
  const createDocumentResult = await createDocument({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    graphql,
    authorizationHeader: sessionKey,
    parentFolderId: addedFolder.parentFolderId,
    contentSubkeyId: documentContentKeyResult.subkeyId,
    workspaceId: addedWorkspace.id,
  });
  addedDocumentId = createDocumentResult.createDocument.id;
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
    parentFolderId: addedFolder.parentFolderId,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    folderKey,
    authorizationHeader,
  });
  const updatedDocument = result.updateDocumentName.document;
  expect(typeof updatedDocument.encryptedName).toBe("string");
  expect(typeof updatedDocument.encryptedNameNonce).toBe("string");
  expect(typeof updatedDocument.nameKeyDerivationTrace.subkeyId).toBe("number");
  const documentSubkey = await recreateDocumentKey({
    folderKey,
    subkeyId: updatedDocument.nameKeyDerivationTrace.subkeyId,
  });
  const decryptedName = await decryptDocumentTitle({
    key: documentSubkey.key,
    ciphertext: updatedDocument.encryptedName,
    publicNonce: updatedDocument.encryptedNameNonce,
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
        parentFolderId: addedFolder.parentFolderId,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        folderKey,
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
    parentFolderId: userData1.folder.parentFolderId,
    workspaceId: userData1.workspace.id,
    contentSubkeyId: 1,
    authorizationHeader: userData1.sessionKey,
  });
  const authorizationHeader = sessionKey;
  const id = otherUserDocumentResult.createDocument.id;
  const name = "Unauthorized Name";
  await expect(
    (async () =>
      await updateDocumentName({
        graphql,
        id,
        name,
        parentFolderId: addedFolder.parentFolderId,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        folderKey,
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
        parentFolderId: addedFolder.parentFolderId,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        folderKey,
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
        parentFolderId: addedFolder.parentFolderId,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        folderKey,
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
        parentFolderId: addedFolder.parentFolderId,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        folderKey,
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
          input: {
            id: 2
            encryptedName: ""
            encryptedNameNonce: ""
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
  test("Invalid name", async () => {
    const query = gql`
        mutation {
            updateDocumentName(
            input: {
              id: "${id}"
              encryptedName: null
              encryptedNameNonce: null
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
            encryptedName: "abc123"
            encryptedNameNonce: "abc123"
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
