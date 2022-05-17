import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { deleteFolders } from "../../../database/folder/deleteFolders";
import { prisma } from "../../../database/prisma";

const graphql = setupGraphql();
const username = "user1";
const username2 = "user2";
const password = "password";
let isUserRegistered = false;
let addedWorkspace: any = null;
let addedFolderId: any = null;
let otherUserWorkspaceId: any = null;

beforeAll(async () => {
  await deleteAllRecords();
});

beforeEach(async () => {
  // TODO: we don't want this before every test
  if (!isUserRegistered) {
    await registerUser(
      graphql,
      username,
      password,
      "9c22b47e-3d5e-4aae-a0b2-7e6f8974e7e2"
    );
    isUserRegistered = true;
    const createWorkspaceResult = await createWorkspace({
      name: "workspace 1",
      id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
      graphql,
      authorizationHeader: `TODO+${username}`,
    });
    addedWorkspace = createWorkspaceResult.createWorkspace.workspace;
    const createFolderResult = await createFolder({
      graphql,
      id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
      parentFolderId: null,
      authorizationHeader: `TODO+${username}`,
      workspaceId: addedWorkspace.id,
    });
    addedFolderId = createFolderResult.createFolder.folder.id;

    await registerUser(
      graphql,
      username2,
      password,
      "2434ae43-1706-4df5-8c41-bda450557dc4"
    );
    const createWorkspaceResult2 = await createWorkspace({
      name: "other user workspace",
      id: "e9f04512-8317-46e0-ae1b-64eddf70690d",
      graphql,
      authorizationHeader: `TODO+${username2}`,
    });
    otherUserWorkspaceId = createWorkspaceResult2.createWorkspace.workspace.id;
  }
});

// user can delete a folder
test("user can delete a folder", async () => {
  // first, create a folder
  const folderId = "43130abd-ffcc-4b6e-abb8-1eebb221dd5e";
  const createFolderResult = await createFolder({
    graphql,
    id: folderId,
    parentFolderId: null,
    authorizationHeader: `TODO+${username}`,
    workspaceId: addedWorkspace.id,
  });
  expect(createFolderResult.createFolder.folder.id).toBe(folderId);
  const folderIds = [folderId];
  await deleteFolders({ username, folderIds });
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
    parentFolderId: null,
    authorizationHeader: `TODO+${username}`,
    workspaceId: addedWorkspace.id,
  });
  const createChildFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    parentFolderId: parentFolderId,
    authorizationHeader: `TODO+${username}`,
    workspaceId: addedWorkspace.id,
  });
  expect(createParentFolderResult.createFolder.folder.id).toBe(parentFolderId);
  expect(createChildFolderResult.createFolder.folder.id).toBe(childFolderId);
  expect(createChildFolderResult.createFolder.folder.parentFolderId).toBe(
    parentFolderId
  );
  const folderIds = [parentFolderId];
  await deleteFolders({ username, folderIds });
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
    parentFolderId: null,
    authorizationHeader: `TODO+${username}`,
    workspaceId: addedWorkspace.id,
  });
  const createFolderResult2 = await createFolder({
    graphql,
    id: folderId2,
    parentFolderId: null,
    authorizationHeader: `TODO+${username}`,
    workspaceId: addedWorkspace.id,
  });
  expect(createFolderResult1.createFolder.folder.id).toBe(folderId1);
  expect(createFolderResult2.createFolder.folder.id).toBe(folderId2);
  const folderIds = [folderId1, folderId2];
  await deleteFolders({ username, folderIds });
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
    parentFolderId: null,
    authorizationHeader: `TODO+${username}`,
    workspaceId: addedWorkspace.id,
  });
  const createParentFolderResult2 = await createFolder({
    graphql,
    id: parentFolderId2,
    parentFolderId: null,
    authorizationHeader: `TODO+${username}`,
    workspaceId: addedWorkspace.id,
  });
  const createChildFolderResult1 = await createFolder({
    graphql,
    id: childFolderId1,
    parentFolderId: parentFolderId1,
    authorizationHeader: `TODO+${username}`,
    workspaceId: addedWorkspace.id,
  });
  const createChildFolderResult2 = await createFolder({
    graphql,
    id: childFolderId2,
    parentFolderId: parentFolderId2,
    authorizationHeader: `TODO+${username}`,
    workspaceId: addedWorkspace.id,
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
  await deleteFolders({ username, folderIds });
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
    parentFolderId: null,
    authorizationHeader: `TODO+${username2}`,
    workspaceId: otherUserWorkspaceId,
  });
  expect(createFoldeResult.createFolder.folder.id).toBe(folderId);
  const folderIds = [folderId];
  await deleteFolders({ username, folderIds });
  // try to retrieve the folder.  It should come back as null
  const folder = await prisma.folder.findFirst({
    where: { id: folderId },
  });
  expect(folder).not.toBe(null);
  expect(folder?.id).toStrictEqual(folderId);
});

// users can't delete folders that don't exist
test("user can't delete folders that don't exist", async () => {
  // first, create a folder
  const folderId = "43130abd-ffcc-4b6e-abb8-1eebb221dd5e";
  const folderIds = [folderId];
  await deleteFolders({ username, folderIds });
  // try to retrieve the folder.  It should come back as null
  const folder = await prisma.folder.findFirst({
    where: { id: folderId },
  });
  expect(folder).not.toBe(null);
  expect(folder?.id).toStrictEqual(folderId);
});
