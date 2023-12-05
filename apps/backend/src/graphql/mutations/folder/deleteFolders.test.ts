import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { Role } from "../../../../prisma/generated/output";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { deleteFolders } from "../../../../test/helpers/folder/deleteFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let userData2: any = undefined;
let userId = "";
let sessionKey = "";
let sessionKey2 = "";
const username = "user1";
const username2 = "user2";
const password = "password22room5K42";
let addedWorkspace: any = null;
let addedFolderId: any = null;
let otherUserWorkspaceId: any = null;
let workspaceKey = "";
let workspaceKey2 = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  sessionKey = userData1.sessionKey;
  userId = userData1.user.id;
  addedWorkspace = userData1.workspace;
  workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspace: addedWorkspace,
  });

  const createFolderResult = await createFolder({
    graphql,
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    name: "Untitled",
    parentKey: workspaceKey,
    parentFolderId: null,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    workspaceId: addedWorkspace.id,
  });
  addedFolderId = createFolderResult.createFolder.folder.id;

  userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  sessionKey2 = userData2.sessionKey;
  otherUserWorkspaceId = userData2.workspace.id;
  workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData2.device,
    deviceEncryptionPrivateKey: userData2.encryptionPrivateKey,
    workspace: userData2.workspace,
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
    parentKey: workspaceKey,
    parentFolderId: null,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    workspaceId: addedWorkspace.id,
  });
  expect(createFolderResult.createFolder.folder.id).toBe(folderId);
  const folderIds = [folderId];
  await deleteFolders({
    graphql,
    ids: folderIds,
    workspaceId: addedWorkspace.id,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
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
    parentKey: workspaceKey,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    workspaceId: addedWorkspace.id,
  });
  const createChildFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: "Child folder",
    parentFolderId: parentFolderId,
    parentKey: workspaceKey,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    workspaceId: addedWorkspace.id,
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
    workspaceId: addedWorkspace.id,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
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
    parentKey: workspaceKey,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    workspaceId: addedWorkspace.id,
  });
  const createFolderResult2 = await createFolder({
    graphql,
    id: folderId2,
    name: "folder 2",
    parentFolderId: null,
    parentKey: workspaceKey,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    workspaceId: addedWorkspace.id,
  });
  expect(createFolderResult1.createFolder.folder.id).toBe(folderId1);
  expect(createFolderResult2.createFolder.folder.id).toBe(folderId2);
  const folderIds = [folderId1, folderId2];
  await deleteFolders({
    graphql,
    ids: folderIds,
    workspaceId: addedWorkspace.id,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
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
    parentKey: workspaceKey,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
    workspaceId: addedWorkspace.id,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
  });
  const createParentFolderResult2 = await createFolder({
    graphql,
    id: parentFolderId2,
    name: "parent folder 2",
    parentFolderId: null,
    parentKey: workspaceKey,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    workspaceId: addedWorkspace.id,
  });
  const createChildFolderResult1 = await createFolder({
    graphql,
    id: childFolderId1,
    name: "child folder",
    parentKey: workspaceKey,
    parentFolderId: parentFolderId1,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    workspaceId: addedWorkspace.id,
  });
  const createChildFolderResult2 = await createFolder({
    graphql,
    id: childFolderId2,
    name: "child folder 2",
    parentKey: workspaceKey,
    parentFolderId: parentFolderId2,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
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
  await deleteFolders({
    graphql,
    ids: folderIds,
    workspaceId: addedWorkspace.id,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
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
    parentKey: workspaceKey,
    parentFolderId: null,
    authorizationHeader: deriveSessionAuthorization({ sessionKey: sessionKey2 })
      .authorization,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    workspaceId: otherUserWorkspaceId,
  });
  expect(createFoldeResult.createFolder.folder.id).toBe(folderId);
  const folderIds = [folderId];
  await deleteFolders({
    graphql,
    ids: folderIds,
    workspaceId: addedWorkspace.id,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
  });
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
  const folderId = "5b5d0365-5e68-499d-bf50-b20665c2cb5e";
  const folderIds = [folderId];
  await deleteFolders({
    graphql,
    ids: folderIds,
    workspaceId: addedWorkspace.id,
    authorizationHeader: deriveSessionAuthorization({ sessionKey })
      .authorization,
  });
  // try to retrieve the folder.  It should come back as null
  const folder = await prisma.folder.findFirst({
    where: { id: folderId },
  });
  expect(folder).toBe(null);
});

test("Commentor tries to delete", async () => {
  const otherUser = await registerUser(
    graphql,
    `${generateId()}@example.com`,
    password
  );
  await prisma.usersToWorkspaces.create({
    data: {
      userId: otherUser.userId,
      workspaceId: addedWorkspace.id,
      role: Role.COMMENTER,
    },
  });
  const folderId = "5b5d0365-5e68-499d-bf50-b20665c2cb5e";
  const folderIds = [folderId];
  await expect(
    (async () =>
      await deleteFolders({
        graphql,
        ids: folderIds,
        workspaceId: addedWorkspace.id,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: otherUser.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Viewer tries to delete", async () => {
  const otherUser = await registerUser(
    graphql,
    `${generateId()}@example.com`,
    password
  );
  await prisma.usersToWorkspaces.create({
    data: {
      userId: otherUser.userId,
      workspaceId: addedWorkspace.id,
      role: Role.VIEWER,
    },
  });
  const folderId = "5b5d0365-5e68-499d-bf50-b20665c2cb5e";
  const folderIds = [folderId];
  await expect(
    (async () =>
      await deleteFolders({
        graphql,
        ids: folderIds,
        workspaceId: addedWorkspace.id,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: otherUser.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Unauthenticated", async () => {
  const folderId = "5b5d0365-5e68-499d-bf50-b20665c2cb5e";
  const folderIds = [folderId];
  await expect(
    (async () =>
      await deleteFolders({
        graphql,
        ids: folderIds,
        workspaceId: addedWorkspace.id,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
  };
  test("Invalid ids", async () => {
    const query = gql`
      mutation deleteFolders($input: DeleteFoldersInput!) {
        deleteFolders(input: $input) {
          status
        }
      }
    `;
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
    const query = gql`
      mutation deleteFolders($input: DeleteFoldersInput!) {
        deleteFolders(input: $input) {
          status
        }
      }
    `;
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
    const query = gql`
      mutation deleteFolders($input: DeleteFoldersInput!) {
        deleteFolders(input: $input) {
          status
        }
      }
    `;
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
