import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { deleteFolders } from "../../../../test/helpers/folder/deleteFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let user1Data: any = undefined;
let user2Data: any = undefined;
const password = "password";
let user1WorkspaceKey = "";
let user2WorkspaceKey = "";

const setup = async () => {
  user1Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  user2Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  user1WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user1Data.device,
    deviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
    workspace: user1Data.workspace,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    name: "Untitled",
    parentKey: user1WorkspaceKey,
    parentFolderId: null,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    workspaceId: user1Data.workspace.id,
    authorizationHeader: user1Data.sessionKey,
  });

  user2WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user2Data.device,
    deviceEncryptionPrivateKey: user2Data.encryptionPrivateKey,
    workspace: user2Data.workspace,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

// user can delete a folder
test("user can delete a folder", async () => {
  // first, create a folder
  const folderId = "43130abd-ffcc-4b6e-abb8-1eebb221dd5e";
  const createFolderResult = await createFolder({
    graphql,
    id: folderId,
    name: "Untitled",
    parentKey: user1WorkspaceKey,
    parentFolderId: null,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    workspaceId: user1Data.workspace.id,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(createFolderResult.createFolder.folder.id).toBe(folderId);
  const folderIds = [folderId];
  await deleteFolders({
    graphql,
    ids: folderIds,
    authorizationHeader: user1Data.sessionKey,
  });
  // try to retrieve the folder. It should come back as null
  const folder = await prisma.folder.findFirst({
    where: { id: "43130abd-ffcc-4b6e-abb8-1eebb221dd5e" },
  });
  expect(folder).toBeNull();
});

// user can delete a folder with children
test("deleting a parent folder will cascade to children", async () => {
  // first, create a folder
  const parentFolderId = "43130abd-ffcc-4b6e-abb8-1eebb221dd5e";
  const childFolderId = "568c369b-a853-4bce-84fc-b3f772f01e31";
  const createParentFolderResult = await createFolder({
    graphql,
    id: parentFolderId,
    name: "Parent folder",
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    workspaceId: user1Data.workspace.id,
  });
  const createChildFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: "Child folder",
    parentFolderId: parentFolderId,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    workspaceId: user1Data.workspace.id,
  });
  expect(createParentFolderResult.createFolder.folder.id).toBe(parentFolderId);
  expect(createChildFolderResult.createFolder.folder.id).toBe(childFolderId);
  expect(createChildFolderResult.createFolder.folder.parentFolderId).toBe(
    parentFolderId
  );
  const folderIds = [parentFolderId];
  await deleteFolders({
    graphql,
    ids: folderIds,
    authorizationHeader: user1Data.sessionKey,
  });
  // try to retrieve the folder.  It should come back as null
  const folder = await prisma.folder.findFirst({
    where: {
      id: childFolderId,
    },
  });
  expect(folder).toBeNull();
});

// user can delete multiple folders
test("user can delete multiple folders", async () => {
  // first, create a folder
  const folderId1 = "43130abd-ffcc-4b6e-abb8-1eebb221dd5e";
  const folderId2 = "568c369b-a853-4bce-84fc-b3f772f01e31";
  const createFolderResult1 = await createFolder({
    graphql,
    id: folderId1,
    name: "folder 1",
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    workspaceId: user1Data.workspace.id,
  });
  const createFolderResult2 = await createFolder({
    graphql,
    id: folderId2,
    name: "folder 2",
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    workspaceId: user1Data.workspace.id,
  });
  expect(createFolderResult1.createFolder.folder.id).toBe(folderId1);
  expect(createFolderResult2.createFolder.folder.id).toBe(folderId2);
  const folderIds = [folderId1, folderId2];
  await deleteFolders({
    graphql,
    ids: folderIds,
    authorizationHeader: user1Data.sessionKey,
  });
  // try to retrieve the folder.  It should come back as null
  const folders = await prisma.folder.findMany({
    where: {
      id: {
        in: folderIds,
      },
    },
  });
  expect(folders).toStrictEqual([]);
});

// user can delete multiple folders with children
test("user can delete multiple folders", async () => {
  // first, create a folder
  const parentFolderId1 = "43130abd-ffcc-4b6e-abb8-1eebb221dd5e";
  const parentFolderId2 = "568c369b-a853-4bce-84fc-b3f772f01e31";
  const childFolderId1 = "3db5c598-01bf-4176-b9e3-6695849a6ecf";
  const childFolderId2 = "b4f236b9-80ba-476e-a621-84fc0644a68e";
  const createParentFolderResult1 = await createFolder({
    graphql,
    id: parentFolderId1,
    name: "parent folder",
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const createParentFolderResult2 = await createFolder({
    graphql,
    id: parentFolderId2,
    name: "parent folder 2",
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const createChildFolderResult1 = await createFolder({
    graphql,
    id: childFolderId1,
    name: "child folder",
    parentFolderId: parentFolderId1,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const createChildFolderResult2 = await createFolder({
    graphql,
    id: childFolderId2,
    name: "child folder 2",
    parentFolderId: parentFolderId2,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(createParentFolderResult1.createFolder.folder.id).toBe(
    parentFolderId1
  );
  expect(createParentFolderResult2.createFolder.folder.id).toBe(
    parentFolderId2
  );
  expect(createChildFolderResult1.createFolder.folder.id).toBe(childFolderId1);
  expect(createChildFolderResult2.createFolder.folder.id).toBe(childFolderId2);
  const folderIds = [parentFolderId1, parentFolderId2];
  await deleteFolders({
    graphql,
    ids: folderIds,
    authorizationHeader: user1Data.sessionKey,
  });
  // try to retrieve the folder.  It should come back as null
  const folders = await prisma.folder.findMany({
    where: {
      id: {
        in: folderIds,
      },
    },
  });
  expect(folders).toStrictEqual([]);
});

// user cannot delete folders they don't own
test("user can't delete folders they don't own", async () => {
  // first, create a folder
  const folderId = "43130abd-ffcc-4b6e-abb8-1eebb221dd5e";
  const createFoldeResult = await createFolder({
    graphql,
    id: folderId,
    name: "folder name",
    parentFolderId: null,
    parentKey: user2WorkspaceKey,
    workspaceId: user2Data.workspace.id,
    workspaceKeyId: user2Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user2Data.sessionKey,
  });
  expect(createFoldeResult.createFolder.folder.id).toBe(folderId);
  const folderIds = [folderId];
  await deleteFolders({
    graphql,
    ids: folderIds,
    authorizationHeader: user1Data.sessionKey,
  });
  // try to retrieve the folder.  It should not have been deleted
  const folder = await prisma.folder.findFirst({
    where: { id: folderId },
  });
  expect(folder).not.toBe(null);
  expect(folder?.id).toStrictEqual(folderId);
});

// users can't delete folders that don't exist
test("user can't delete folders that don't exist", async () => {
  // first, create a folder
  const folderId = "5b5d0365-5e68-499d-bf50-b20665c2cb5e";
  const folderIds = [folderId];
  await deleteFolders({
    graphql,
    ids: folderIds,
    authorizationHeader: user1Data.sessionKey,
  });
  // try to retrieve the folder.  It should come back as null
  const folder = await prisma.folder.findFirst({
    where: { id: folderId },
  });
  expect(folder).toBe(null);
});

test("Unauthenticated", async () => {
  const folderId = "5b5d0365-5e68-499d-bf50-b20665c2cb5e";
  const folderIds = [folderId];
  await expect(
    (async () =>
      await deleteFolders({
        graphql,
        ids: folderIds,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation deleteFolders($input: DeleteFoldersInput!) {
      deleteFolders(input: $input) {
        status
      }
    }
  `;
  test("Invalid ids", async () => {
    const userData = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    const authorizationHeaders = { authorization: userData.sessionKey };
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { input: { ids: null } },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    const userData = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    const authorizationHeaders = { authorization: userData.sessionKey };
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { input: null },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    const userData = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    const authorizationHeaders = { authorization: userData.sessionKey };
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
