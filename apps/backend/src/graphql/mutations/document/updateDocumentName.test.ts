import {
  createDocumentKey,
  decryptDocumentTitle,
  folderDerivedKeyContext,
  recreateDocumentKey,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { updateDocumentName } from "../../../../test/helpers/document/updateDocumentName";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let user1Data: any = null;
let user1WorkspaceKey = "";
let folderKey = "";
const password = "password";

const setup = async () => {
  user1Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  user1WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user1Data.device,
    deviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
    workspace: user1Data.workspace,
  });
  const folderKeyResult = await kdfDeriveFromKey({
    key: user1WorkspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: user1Data.folder.subkeyId,
  });
  folderKey = folderKeyResult.key;
  let documentContentKeyResult = await createDocumentKey({
    folderKey,
  });
  await createDocument({
    id: uuidv4(),
    graphql,
    parentFolderId: user1Data.folder.parentFolderId,
    contentSubkeyId: documentContentKeyResult.subkeyId,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    workspaceId: user1Data.workspace.id,
    authorizationHeader: user1Data.sessionKey,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to change a document name", async () => {
  const name = "Updated name";
  const result = await updateDocumentName({
    graphql,
    id: user1Data.document.id,
    name,
    parentFolderId: user1Data.folder.parentFolderId,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    folderKey,
    authorizationHeader: user1Data.sessionKey,
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
  const id = "badthing";
  const name = "Doesn't Exist Name";
  await expect(
    (async () =>
      await updateDocumentName({
        graphql,
        id,
        name,
        parentFolderId: user1Data.folder.parentFolderId,
        workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
        folderKey,
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("Throw error when user doesn't have access", async () => {
  // create a new user with access to different documents
  const user2Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  const otherUserDocumentResult = await createDocument({
    graphql,
    id: uuidv4(),
    parentFolderId: null,
    contentSubkeyId: 1,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user2Data.sessionKey,
  });
  await expect(
    (async () =>
      await updateDocumentName({
        graphql,
        id: user1Data.document.id,
        name: "Unauthorized Name",
        parentFolderId: user1Data.folder.parentFolderId,
        workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
        folderKey,
        authorizationHeader: user2Data.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await updateDocumentName({
        graphql,
        id: user1Data.document.id,
        name: "Updated Name",
        parentFolderId: user1Data.folder.parentFolderId,
        workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
        folderKey,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation updateDocumentName($input: UpdateDocumentNameInput!) {
      updateDocumentName(input: $input) {
        document {
          id
        }
      }
    }
  `;
  test("Invalid Id", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: "badid",
              encryptedName: "",
              encryptedNameNonce: "",
              subkeyId: 1,
            },
          },
          {
            authorizationHeaders: user1Data.sessionKey,
          }
        ))()
    ).rejects.toThrowError();
  });
  test("Invalid name", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: uuidv4(),
              encryptedName: null,
              encryptedNameNonce: "",
              subkeyId: 1,
            },
          },
          {
            authorizationHeaders: user1Data.sessionKey,
          }
        ))()
    ).rejects.toThrowError();
  });
  test("Invalid subkeyId", async () => {
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: uuidv4(),
              encryptedName: "",
              encryptedNameNonce: "",
              subkeyId: "lala",
            },
          },
          {
            authorizationHeaders: user1Data.sessionKey,
          }
        ))()
    ).rejects.toThrowError();
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
        await graphql.client.request(query, null, {
          authorizationHeaders: user1Data.sessionKey,
        }))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
});
