import {
  decryptDocumentTitle,
  folderDerivedKeyContext,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { decryptWorkspaceKey } from "../../../../test/helpers/device/decryptWorkspaceKey";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { updateDocumentName } from "../../../../test/helpers/document/updateDocumentName";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
const username = "user1";
const password = "password";
let addedWorkspace: any = null;
let addedFolder: any = null;
let addedDocumentId = "";
let sessionKey = "";
let workspaceKey = "";
let folderKey = "";

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  sessionKey = registerUserResult.sessionKey;
  const device = registerUserResult.mainDevice;
  const createWorkspaceResult = await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    deviceSigningPublicKey: device.signingPublicKey,
    deviceEncryptionPublicKey: device.encryptionPublicKey,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    folderName: "Getting started",
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
  addedWorkspace =
    createWorkspaceResult.createInitialWorkspaceStructure.workspace;
  const createDocumentResult = await createDocument({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    graphql,
    authorizationHeader: sessionKey,
    parentFolderId: null,
    workspaceId: addedWorkspace.id,
  });
  addedDocumentId = createDocumentResult.createDocument.id;
  const workspaceKeyBox = addedWorkspace.currentWorkspaceKey.workspaceKeyBox;
  workspaceKey = await decryptWorkspaceKey({
    ciphertext: workspaceKeyBox.ciphertext,
    nonce: workspaceKeyBox.nonce,
    creatorDeviceEncryptionPublicKey:
      registerUserResult.mainDevice.encryptionPublicKey,
    receiverDeviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
  });
  addedFolder = createWorkspaceResult.createInitialWorkspaceStructure.folder;
  const folderKeyResult = await kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: addedFolder.subKeyId,
  });
  folderKey = folderKeyResult.key;
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
    folderKey,
    authorizationHeader,
  });
  const updatedDocument = result.updateDocumentName.document;
  expect(typeof updatedDocument.encryptedName).toBe("string");
  expect(typeof updatedDocument.encryptedNameNonce).toBe("string");
  expect(typeof updatedDocument.subkeyId).toBe("number");
  const documentSubkey = await recreateDocumentKey({
    folderKey,
    subkeyId: updatedDocument.subkeyId,
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
        folderKey,
        authorizationHeader,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("Throw error when user doesn't have access", async () => {
  // create a new user with access to different documents
  const username2 = "user2";
  const registerUserResult = await registerUser(graphql, username2, password);
  const device = registerUserResult.mainDevice;
  const createWorkspaceResult = await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: "95ad4e7a-f476-4bba-a650-8bb586d94ed3",
    deviceSigningPublicKey: device.signingPublicKey,
    deviceEncryptionPublicKey: device.encryptionPublicKey,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    folderName: "Getting started",
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: registerUserResult.sessionKey,
  });
  addedWorkspace =
    createWorkspaceResult.createInitialWorkspaceStructure.workspace;
  const otherUserDocumentResult = await createDocument({
    id: "97a4c517-5ef2-4ea8-ac40-86a1e182bf23",
    graphql,
    authorizationHeader: registerUserResult.sessionKey,
    parentFolderId: null,
    workspaceId: addedWorkspace.id,
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
        folderKey,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Unauthorized");
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
            id: ""
            name: "updated name"
            encryptedName: ""
            encryptedNameNonce: ""
            subkeyId: 1
          }
        ) {
          document {
            name
            id
          }
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid name", async () => {
    const query = gql`
        mutation {
            updateDocumentName(
            input: {
              id: "${id}"
              name: ""
              encryptedName: ""
              encryptedNameNonce: ""
              subkeyId: 1
            }
          ) {
            document {
              name
              id
            }
          }
        }
      `;
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid subkeyId", async () => {
    const query = gql`
      mutation {
        updateDocumentName(
          input: {
            id: ""
            name: "updated name"
            encryptedName: "abc123"
            encryptedNameNonce: "abc123"
            subkeyId: 0
          }
        ) {
          document {
            name
            id
          }
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    const query = gql`
      mutation {
        updateDocumentName(input: null) {
          document {
            name
            id
          }
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
