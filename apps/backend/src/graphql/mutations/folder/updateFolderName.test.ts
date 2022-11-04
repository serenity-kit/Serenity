import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { updateFolderName } from "../../../../test/helpers/folder/updateFolderName";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let user1Data: any = null;
let user1WorkspaceKey: any = null;

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
  await createFolder({
    graphql,
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    name: "folder",
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to change a folder name", async () => {
  const result = await updateFolderName({
    graphql,
    id: user1Data.folder.id,
    name: "Updated Name",
    workspaceKey: user1WorkspaceKey,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    parentFolderId: user1Data.folder.parentFolderId,
    authorizationHeader: user1Data.sessionKey,
  });
  const updatedFolder = result.updateFolderName.folder;
  expect(updatedFolder.id).toBe(user1Data.folder.id);
  expect(typeof updatedFolder.encryptedName).toBe("string");
  expect(typeof updatedFolder.encryptedNameNonce).toBe("string");
  expect(typeof updatedFolder.subkeyId).toBe("number");
  expect(updatedFolder.parentFolderId).toBe(null);
  expect(updatedFolder.rootFolderId).toBe(null);
  expect(updatedFolder.workspaceId).toBe(user1Data.workspace.id);
});

test("throw error when folder doesn't exist", async () => {
  await expect(
    (async () =>
      await updateFolderName({
        graphql,
        id: "bad-id",
        name: "Updated Name",
        workspaceKey: user1WorkspaceKey,
        workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
        parentFolderId: user1Data.folder.parentFolderId,
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("throw error when user doesn't have access", async () => {
  const user2Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  const user2WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user1Data.device,
    deviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
    workspace: user1Data.workspace,
  });
  const otherUserFolderResult = await createFolder({
    graphql,
    id: "97a4c517-5ef2-4ea8-ac40-86a1e182bf23",
    name: "folder",
    parentFolderId: null,
    parentKey: user2WorkspaceKey,
    authorizationHeader: user2Data.sessionKey,
    workspaceId: user2Data.workspace.id,
    workspaceKeyId: user2Data.workspace.currentWorkspaceKey?.id!,
  });
  const id = otherUserFolderResult.createFolder.folder.id;
  await expect(
    (async () =>
      await updateFolderName({
        graphql,
        id,
        name: "Unauthorized Name",
        workspaceKey: user2WorkspaceKey,
        workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
        parentFolderId: otherUserFolderResult.parentFolderId,
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await updateFolderName({
        graphql,
        id: "97a4c517-5ef2-4ea8-ac40-86a1e182bf23",
        name: "renamed",
        workspaceKey: user1WorkspaceKey,
        workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
        parentFolderId: null,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  test("Invalid id", async () => {
    const query = gql`
      mutation updateFolderName($input: UpdateFolderNameInput!) {
        updateFolderName(input: $input) {
          folder {
            id
            parentFolderId
            rootFolderId
            workspaceId
          }
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(query, null, {
          authorizationHeaders: user1Data.sessionKey,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid name", async () => {
    const query = gql`
      mutation updateFolderName($input: UpdateFolderNameInput!) {
        updateFolderName(input: $input) {
          folder {
            id
            parentFolderId
            rootFolderId
            workspaceId
          }
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(query, null, {
          authorizationHeaders: user1Data.sessionKey,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    const query = gql`
      mutation {
        updateFolderName(input: null) {
          folder {
            id
            parentFolderId
            rootFolderId
            workspaceId
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
