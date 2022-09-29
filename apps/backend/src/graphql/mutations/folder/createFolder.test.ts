import {
  encryptFolderName,
  folderDerivedKeyContext,
} from "@serenity-tools/common";
import { kdfDeriveFromKey } from "@serenity-tools/common/src/kdfDeriveFromKey/kdfDeriveFromKey";
import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { prisma } from "../../../database/prisma";

const graphql = setupGraphql();
const username = "user1";
const password = "password";
let userAndDevice: any = null;
let workspaceKey: string = "";
let addedWorkspace: any = null;
let sessionKey = "";
let addedWorkspaceStructure: any = null;

const setup = async () => {
  userAndDevice = await registerUser(graphql, username, password);
  sessionKey = userAndDevice.sessionKey;
  const device = userAndDevice.mainDevice;
  const createWorkspaceResult = await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    deviceSigningPublicKey: device.signingPublicKey,
    deviceEncryptionPublicKey: device.encryptionPublicKey,
    deviceEncryptionPrivateKey: userAndDevice.encryptionPrivateKey,
    folderName: "Getting started",
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
  addedWorkspaceStructure =
    createWorkspaceResult.createInitialWorkspaceStructure;
  addedWorkspace =
    createWorkspaceResult.createInitialWorkspaceStructure.workspace;
  workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: userAndDevice.mainDevice,
    deviceEncryptionPrivateKey: userAndDevice.encryptionPrivateKey,
    workspace: addedWorkspace,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to create a root folder", async () => {
  const authorizationHeader = sessionKey;
  const id = "c103a784-35cb-4aee-b366-d10398b6dd95";
  const parentFolderId = null;
  const name = "Untitled";

  const result = await createFolder({
    graphql,
    id,
    name,
    parentFolderId,
    parentKey: workspaceKey,
    workspaceId: addedWorkspace.id,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    authorizationHeader,
  });
  const folder = result.createFolder.folder;
  expect(folder.id).toBe(id);
  expect(typeof folder.encryptedName).toBe("string");
  expect(folder.parentFolderId).toBe(parentFolderId);
  expect(folder.workspaceId).toBe(addedWorkspace.id);
  expect(typeof folder.encryptedNameNonce).toBe("string");
  expect(typeof folder.subkeyId).toBe("number");
});

test("user should be able to create a root folder with a name", async () => {
  const authorizationHeader = sessionKey;
  const id = "cb3e4195-40e2-45c0-8b87-8415abdc6b55";
  const parentFolderId = null;
  const name = "Named Folder";
  const result = await createFolder({
    graphql,
    id,
    name,
    parentFolderId,
    parentKey: workspaceKey,
    workspaceId: addedWorkspace.id,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    authorizationHeader,
  });
  const folder = result.createFolder.folder;
  expect(folder.id).toBe(id);
  expect(typeof folder.encryptedName).toBe("string");
  expect(folder.parentFolderId).toBe(parentFolderId);
  expect(folder.workspaceId).toBe(addedWorkspace.id);
  expect(typeof folder.encryptedNameNonce).toBe("string");
  expect(typeof folder.subkeyId).toBe("number");
});

test("user should be able to create a child folder", async () => {
  const authorizationHeader = sessionKey;
  const id = "c3d28056-b619-41c4-be51-ce89ed5b8be4";
  const parentFolderId = "c103a784-35cb-4aee-b366-d10398b6dd95";
  const name = "Untitled";

  const parentFolder = await prisma.folder.findFirst({
    where: { id: parentFolderId },
  });
  const parentFolderKey = await kdfDeriveFromKey({
    key: workspaceKey,
    context: folderDerivedKeyContext,
    subkeyId: parentFolder?.subkeyId,
  });
  const result = await createFolder({
    graphql,
    id,
    name,
    parentKey: parentFolderKey.key,
    parentFolderId,
    workspaceId: addedWorkspace.id,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    authorizationHeader,
  });
  const folder = result.createFolder.folder;
  expect(folder.id).toBe(id);
  expect(typeof folder.encryptedName).toBe("string");
  expect(folder.parentFolderId).toBe(parentFolderId);
  expect(folder.workspaceId).toBe(addedWorkspace.id);
  expect(typeof folder.encryptedNameNonce).toBe("string");
  expect(typeof folder.subkeyId).toBe("number");
});

test("duplicate ID throws an error", async () => {
  const authorizationHeader = sessionKey;
  const id = uuidv4();
  const parentFolderId = null;
  const name = "Untitled";
  await createFolder({
    graphql,
    id,
    name,
    parentKey: workspaceKey,
    parentFolderId,
    workspaceId: addedWorkspace.id,
    workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
    authorizationHeader,
  });
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        name,
        parentKey: workspaceKey,
        parentFolderId,
        workspaceId: addedWorkspace.id,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader,
      }))()
  ).rejects.toThrow("Invalid input: duplicate id");
});

test("Throw error on duplicate subkeyId, workspaceId", async () => {
  const authorizationHeaders = { authorization: sessionKey };
  const name = "subkey test";
  const encryptedFolderResult = await encryptFolderName({
    name,
    parentKey: workspaceKey,
  });
  const workspaceId = addedWorkspaceStructure.workspace.id;
  const existingSubkeyId = addedWorkspaceStructure.folder.subkeyId;
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
        authorizationHeaders
      ))()
  ).rejects.toThrowError(/BAD_USER_INPUT/);
});

test("Throw error when the parent folder doesn't exist", async () => {
  const authorizationHeader = sessionKey;
  const id = "92d85bfd-0970-48e2-80b0-f100789e1350";
  const parentFolderId = "badthing";
  const name = "Untitled";
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        name,
        parentKey: workspaceKey,
        parentFolderId,
        workspaceId: addedWorkspace.id,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
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
    deviceEncryptionPrivateKey: userAndDevice.encryptionPrivateKey,
    folderName: "Getting started",
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: registerUserResult.sessionKey,
  });
  const otherAddedWorkspace =
    createWorkspaceResult.createInitialWorkspaceStructure.workspace;
  const name = "Untitled";
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id: "1d283506-9de4-426b-8a02-567f0645dc31",
        name,
        parentKey: workspaceKey,
        parentFolderId: null,
        workspaceId: otherAddedWorkspace.id,
        workspaceKeyId: addedWorkspace.currentWorkspaceKey.id,
        authorizationHeader: sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  const id = uuidv4();
  await expect(
    (async () =>
      await createFolder({
        graphql,
        id,
        name: "test",
        parentKey: workspaceKey,
        parentFolderId: null,
        workspaceId: addedWorkspace.id,
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
    const name = "test";
    const encryptedFolderResult = await encryptFolderName({
      name,
      parentKey: workspaceKey,
    });
    const encryptedName = encryptedFolderResult.ciphertext;
    const encryptedNameNonce = encryptedFolderResult.publicNonce;
    const subkeyId = encryptedFolderResult.folderSubkeyId;
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
              id: null,
              name,
              encryptedName,
              encryptedNameNonce,
              subkeyId,
              parentFolderId: null,
              workspaceId: addedWorkspace.id,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid workspaceId", async () => {
    const name = "test";
    const encryptedFolderResult = await encryptFolderName({
      name,
      parentKey: workspaceKey,
    });
    const encryptedName = encryptedFolderResult.ciphertext;
    const encryptedNameNonce = encryptedFolderResult.publicNonce;
    const subkeyId = encryptedFolderResult.folderSubkeyId;
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
              subkeyId,
              parentFolderId: null,
              workspaceId: null,
            },
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid input", async () => {
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
            input: null,
          },
          authorizationHeaders
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
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
        await graphql.client.request(query, null, authorizationHeaders))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
