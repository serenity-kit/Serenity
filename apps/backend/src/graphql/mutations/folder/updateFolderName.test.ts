import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import { Role } from "../../../../prisma/generated/output";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { updateFolderName } from "../../../../test/helpers/folder/updateFolderName";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
const username = "user1";
const password = "password22room5K42";
let sessionKey = "";
let addedWorkspace: any = null;
let addedFolder: any = null;
let addedFolderId: any = null;
let workspaceKey = "";

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  addedWorkspace = userData1.workspace;
  workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspace: userData1.workspace,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    name: "folder",
    parentFolderId: null,
    parentKey: workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  addedFolder = createFolderResult.createFolder.folder;
  addedFolderId = createFolderResult.createFolder.folder.id;
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to change a folder name", async () => {
  const name = "Updated Name";
  const result = await updateFolderName({
    graphql,
    id: userData1.folder.id,
    name,
    workspaceKey,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    parentFolderId: userData1.folder.parentFolderId,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    workspaceId: userData1.workspace.id,
  });
  const updatedFolder = result.updateFolderName.folder;
  expect(updatedFolder.id).toBe(userData1.folder.id);
  expect(typeof updatedFolder.nameCiphertext).toBe("string");
  expect(typeof updatedFolder.nameNonce).toBe("string");
  expect(updatedFolder.parentFolderId).toBe(null);
  expect(updatedFolder.rootFolderId).toBe(null);
  expect(updatedFolder.workspaceId).toBe(addedWorkspace.id);
});

test("throw error when folder doesn't exist", async () => {
  const id = "bad-id";
  const name = "Doesn't Exist Name";
  await expect(
    (async () =>
      await updateFolderName({
        graphql,
        id,
        name,
        workspaceKey,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        parentFolderId: null,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
        workspaceId: userData1.workspace.id,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("throw error when user doesn't have access", async () => {
  // create a new user with access to different folders
  const userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  const newFolder = userData2.folder;
  const otherUserFolderResult = await createFolder({
    graphql,
    id: generateId(),
    name: "unauthorized folder",
    parentFolderId: null,
    parentKey: workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey!.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  const authorizationHeader = deriveSessionAuthorization({
    sessionKey,
  }).authorization;
  const id = otherUserFolderResult.createFolder.folder.id;
  const name = "Unauthorized Name";
  await expect(
    (async () =>
      await updateFolderName({
        graphql,
        id,
        name,
        workspaceKey,
        workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
        parentFolderId: newFolder.parentFolderId,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData2.sessionKey,
        }).authorization,
        workspaceId: userData1.workspace.id,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Commentor tries to update", async () => {
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
  await expect(
    (async () =>
      await updateFolderName({
        graphql,
        id: "97a4c517-5ef2-4ea8-ac40-86a1e182bf23",
        name: "renamed",
        workspaceKey,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        parentFolderId: null,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: otherUser.sessionKey,
        }).authorization,
        workspaceId: addedWorkspace.id,
      }))()
  ).rejects.toThrowError("Unauthorized");
});

test("Viewer tries to update", async () => {
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
  await expect(
    (async () =>
      await updateFolderName({
        graphql,
        id: "97a4c517-5ef2-4ea8-ac40-86a1e182bf23",
        name: "renamed",
        workspaceKey,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        parentFolderId: null,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: otherUser.sessionKey,
        }).authorization,
        workspaceId: addedWorkspace.id,
      }))()
  ).rejects.toThrowError("Unauthorized");
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
        parentFolderId: null,
        authorizationHeader: "badauthheader",
        workspaceId: addedWorkspace.id,
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const authorizationHeaders = {
    authorization: deriveSessionAuthorization({ sessionKey }).authorization,
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
        await graphql.client.request<any>(
          query,
          undefined,
          authorizationHeaders
        ))()
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
        await graphql.client.request<any>(
          query,
          undefined,
          authorizationHeaders
        ))()
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
        await graphql.client.request<any>(
          query,
          undefined,
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/GRAPHQL_VALIDATION_FAILED/);
  });
});
