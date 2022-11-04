import {
  encryptFolderName,
  folderDerivedKeyContext,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { prisma } from "../../../database/prisma";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let user1Data: any = null;
let user1WorkspaceKey = "";

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
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to create a root folder", async () => {
  const id = uuidv4();
  const parentFolderId = null;
  const result = await createFolder({
    graphql,
    id,
    name: "Untitled",
    parentFolderId,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const folder = result.createFolder.folder;
  expect(folder.id).toBe(id);
  expect(typeof folder.encryptedName).toBe("string");
  expect(folder.parentFolderId).toBe(parentFolderId);
  expect(folder.workspaceId).toBe(user1Data.workspace.id);
  expect(typeof folder.encryptedNameNonce).toBe("string");
  expect(typeof folder.subkeyId).toBe("number");
});

test("user should be able to create a root folder with a name", async () => {
  const id = "cb3e4195-40e2-45c0-8b87-8415abdc6b55";
  const parentFolderId = null;
  const name = "Named Folder";
  const result = await createFolder({
    graphql,
    id,
    name,
    parentFolderId,
    parentKey: user1WorkspaceKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const folder = result.createFolder.folder;
  expect(folder.id).toBe(id);
  expect(typeof folder.encryptedName).toBe("string");
  expect(folder.parentFolderId).toBe(parentFolderId);
  expect(folder.workspaceId).toBe(user1Data.workspace.id);
  expect(typeof folder.encryptedNameNonce).toBe("string");
  expect(typeof folder.subkeyId).toBe("number");
});

test("user should be able to create a child folder", async () => {
  const id = uuidv4();
  const parentFolderId = user1Data.folder.id;
  const name = "Untitled";
  const parentFolder = await prisma.folder.findFirst({
    where: { id: parentFolderId },
  });
  const parentFolderKey = await kdfDeriveFromKey({
    key: user1WorkspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: parentFolder?.subkeyId,
  });
  const result = await createFolder({
    graphql,
    id,
    name,
    parentFolderId,
    parentKey: parentFolderKey.key,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  const folder = result.createFolder.folder;
  expect(folder.id).toBe(id);
  expect(typeof folder.encryptedName).toBe("string");
  expect(folder.parentFolderId).toBe(parentFolderId);
  expect(folder.workspaceId).toBe(user1Data.workspace.id);
  expect(typeof folder.encryptedNameNonce).toBe("string");
  expect(typeof folder.subkeyId).toBe("number");
});

test("duplicate ID throws an error", async () => {
  const id = uuidv4();
  const parentFolderId = null;
  const name = "Untitled";
  await createFolder({
    graphql,
    id,
    name,
    parentKey: user1WorkspaceKey,
    parentFolderId,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
    authorizationHeader: user1Data.sessionKey,
  });
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        name,
        parentKey: user1WorkspaceKey,
        parentFolderId,
        workspaceId: user1Data.workspace.id,
        workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrow("Invalid input: duplicate id");
});

test("Throw error on duplicate subkeyId, workspaceId", async () => {
  const name = "subkey test";
  const encryptedFolderResult = await encryptFolderName({
    name,
    parentKey: user1WorkspaceKey,
  });
  const workspaceId = user1Data.workspace.id;
  const existingSubkeyId = user1Data.folder.subkeyId;
  const encryptedName = encryptedFolderResult.ciphertext;
  const encryptedNameNonce = encryptedFolderResult.publicNonce;
  const query = gql`
    mutation createFolder($input: CreateFolderInput!) {
      createFolder(input: $input) {
        folder {
          id
          encryptedName
          encryptedNameNonce
          subkeyId
          parentFolderId
          rootFolderId
          workspaceId
        }
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        {
          input: {
            id: "abc123",
            name,
            encryptedName,
            encryptedNameNonce,
            subkeyId: existingSubkeyId,
            parentFolderId: null,
            workspaceId: workspaceId,
          },
        },
        { authorizationHeader: user1Data.sessionKey }
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Throw error when the parent folder doesn't exist", async () => {
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id: uuidv4(),
        name: "Untitled",
        parentKey: user1WorkspaceKey,
        parentFolderId: "invalid-parent-folder-id",
        workspaceId: user1Data.workspace.id,
        workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
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
  const user2WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user1Data.device,
    deviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
    workspace: user1Data.workspace,
  });
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id: uuidv4(),
        name: "New workspace",
        parentKey: user2WorkspaceKey,
        parentFolderId: null,
        workspaceId: user2Data.workspace.id,
        workspaceKeyId: user2Data.workspace.currentWorkspaceKey?.id!,
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  const id = uuidv4();
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id: uuidv4(),
        name: "New workspace",
        parentKey: user1WorkspaceKey,
        parentFolderId: null,
        workspaceId: user1Data.workspace.id,
        workspaceKeyId: user1Data.workspace.currentWorkspaceKey?.id!,
        authorizationHeader: "bad-session-key",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    mutation createFolder($input: CreateFolderInput!) {
      createFolder(input: $input) {
        folder {
          id
          encryptedName
          encryptedNameNonce
          subkeyId
          parentFolderId
          rootFolderId
          workspaceId
        }
      }
    }
  `;
  test("Invalid id", async () => {
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
    const name = "test";
    const encryptedFolderResult = await encryptFolderName({
      name,
      parentKey: user2WorkspaceKey,
    });
    const encryptedName = encryptedFolderResult.ciphertext;
    const encryptedNameNonce = encryptedFolderResult.publicNonce;
    const subkeyId = encryptedFolderResult.folderSubkeyId;
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: null,
              name,
              encryptedName,
              encryptedNameNonce,
              subkeyId,
              parentFolderId: null,
              workspaceId: user2Data.workspace.id,
            },
          },
          { authorizationHeaders: user2Data.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid workspaceId", async () => {
    const user2Data = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    const user2WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
      device: user2Data.device,
      deviceEncryptionPrivateKey: user2Data.encryptionPrivateKey,
      workspace: user2Data.workspace,
    });
    const encryptedFolderResult = await encryptFolderName({
      name: "new folder",
      parentKey: user2WorkspaceKey,
    });
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          {
            input: {
              id: uuidv4(),
              name: "test",
              encryptedName: encryptedFolderResult.ciphertext,
              encryptedNameNonce: encryptedFolderResult.publicNonce,
              subkeyId: encryptedFolderResult.folderSubkeyId,
              parentFolderId: null,
              workspaceId: null,
            },
          },
          { authorizationHeaders: user2Data.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
    const userData = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request(query, null, {
          authorizationHeaders: userData.sessionKey,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    const userData = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request(query, null, {
          authorizationHeaders: userData.sessionKey,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
