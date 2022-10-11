import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { updateFolderName } from "../../../../test/helpers/folder/updateFolderName";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
const username = "user1";
const password = "password";
let sessionKey = "";
let addedWorkspace: any = null;
let addedFolder: any = null;
let addedFolderId: any = null;
let workspaceKey = "";

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
    webDevice: registerUserResult.webDevice,
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
  workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: registerUserResult.mainDevice,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    workspace: addedWorkspace,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    name: "folder",
    parentFolderId: null,
    parentKey: workspaceKey,
    authorizationHeader: sessionKey,
    workspaceId: addedWorkspace.id,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
  });
  addedFolder = createFolderResult.createFolder.folder;
  addedFolderId = createFolderResult.createFolder.folder.id;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to change a folder name", async () => {
  const authorizationHeader = sessionKey;
  const id = addedFolderId;
  const name = "Updated Name";
  const result = await updateFolderName({
    graphql,
    id,
    name,
    workspaceKey,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    authorizationHeader,
  });
  const updatedFolder = result.updateFolderName.folder;
  expect(updatedFolder.id).toBe(addedFolderId);
  expect(typeof updatedFolder.encryptedName).toBe("string");
  expect(typeof updatedFolder.encryptedNameNonce).toBe("string");
  expect(typeof updatedFolder.subkeyId).toBe("number");
  expect(updatedFolder.parentFolderId).toBe(null);
  expect(updatedFolder.rootFolderId).toBe(null);
  expect(updatedFolder.workspaceId).toBe(addedWorkspace.id);
});

test("throw error when folder doesn't exist", async () => {
  const authorizationHeader = sessionKey;
  const id = "badthing";
  const name = "Doesn't Exist Name";
  await expect(
    (async () =>
      await updateFolderName({
        graphql,
        id,
        name,
        workspaceKey,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("throw error when user doesn't have access", async () => {
  // create a new user with access to different folders
  const username2 = "user2";
  const registerUserResult = await registerUser(graphql, username2, password);
  const device = registerUserResult.mainDevice;
  // sessionKey = registerUserResult.sessionKey;
  const createWorkspaceResult = await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: "95ad4e7a-f476-4bba-a650-8bb586d94ed3",
    deviceSigningPublicKey: device.signingPublicKey,
    deviceEncryptionPublicKey: device.encryptionPublicKey,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    webDevice: registerUserResult.webDevice,
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
  const workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: registerUserResult.mainDevice,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    workspace: addedWorkspace,
  });
  const otherUserFolderResult = await createFolder({
    graphql,
    id: "97a4c517-5ef2-4ea8-ac40-86a1e182bf23",
    name: "folder",
    parentFolderId: null,
    parentKey: workspaceKey,
    authorizationHeader: registerUserResult.sessionKey,
    workspaceId: addedWorkspace.id,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
  });
  const authorizationHeader = sessionKey;
  const id = otherUserFolderResult.createFolder.folder.id;
  const name = "Unauthorized Name";
  await expect(
    (async () =>
      await updateFolderName({
        graphql,
        id,
        name,
        workspaceKey,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader,
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
        workspaceKey,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: sessionKey,
  };
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
        await graphql.client.request(query, null, authorizationHeaders))()
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
        await graphql.client.request(query, null, authorizationHeaders))()
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
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
});
