import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let user1Data: any = undefined;
let user2Data: any = undefined;
let user1WorkspaceKey = "";
let user2WorkspaceKey = "";
const password = "password";

const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";

const parentDocumentId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const documentId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const otherDocumentId = "929ca262-f144-40f7-8fe2-d3147f415f26";

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

  const createParentFolderResult = await createFolder({
    graphql,
    id: parentFolderId,
    name: "parent folder",
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: folderId,
    name: "folder",
    parentFolderId: parentFolderId,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });
  const createChildFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: "child folder",
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });
  await createDocument({
    graphql,
    id: parentDocumentId,
    parentFolderId: parentFolderId,
    workspaceId: user1Data.workspace.id,
    contentSubkeyId: 1,
    authorizationHeader: user1Data.sessionKey,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });
  await createDocument({
    graphql,
    id: documentId,
    parentFolderId: folderId,
    workspaceId: user1Data.workspace.id,
    contentSubkeyId: 2,
    authorizationHeader: user1Data.sessionKey,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });

  user2Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  user2WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user1Data.device,
    deviceEncryptionPrivateKey: user1Data.encryptionPrivateKey,
    workspace: user1Data.workspace,
  });

  const createOtherFolderResult = await createFolder({
    graphql,
    id: otherFolderId,
    name: "other folder",
    parentFolderId: null,
    parentKey: user2WorkspaceKey,
    authorizationHeader: user2Data.sessionKey,
    workspaceId: user2Data.workspace.id,
    workspaceKeyId: user2Data.workspace.currentWorkspaceKey.id,
  });
  await createDocument({
    graphql,
    id: otherDocumentId,
    parentFolderId: otherFolderId,
    workspaceId: user2Data.workspace.id,
    contentSubkeyId: 3,
    authorizationHeader: user2Data.sessionKey,
    workspaceKeyId: user2Data.workspace.currentWorkspaceKey.id,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to get a document path", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  const query = gql`
    query documentPath($id: ID!) {
      documentPath(id: $id) {
        id
        parentFolderId
        rootFolderId
        workspaceId
        encryptedName
        encryptedNameNonce
        keyDerivationTrace {
          workspaceKeyId
          parentFolders {
            folderId
            subkeyId
            parentFolderId
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { id: parentDocumentId },
    authorizationHeader
  );
  const documentPath = result.documentPath;
  expect(documentPath.length).toBe(1);
  for (const documentPathItem of documentPath) {
    expect(documentPathItem.id).toBe(parentFolderId);
    expect(documentPathItem.parentFolderId).toBe(null);
    expect(documentPathItem.rootFolderId).toBe(null);
    expect(documentPathItem.workspaceId).toBe(user1Data.workspace.id);
    expect(typeof documentPathItem.encryptedName).toBe("string");
    expect(typeof documentPathItem.encryptedNameNonce).toBe("string");
  }
});

test("user should be able to get a document path for a deep tree", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  const query = gql`
    query documentPath($id: ID!) {
      documentPath(id: $id) {
        id
        parentFolderId
        rootFolderId
        workspaceId
        encryptedName
        encryptedNameNonce
        keyDerivationTrace {
          workspaceKeyId
          parentFolders {
            folderId
            subkeyId
            parentFolderId
          }
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    { id: documentId },
    authorizationHeader
  );

  const documentPath = result.documentPath;
  expect(documentPath.length).toBe(2);
  for (const documentPathItem of documentPath) {
    expect(typeof documentPathItem.encryptedName).toBe("string");
    expect(typeof documentPathItem.encryptedNameNonce).toBe("string");
    expect(documentPathItem.workspaceId).toBe(user1Data.workspace.id);
    if (documentPathItem.id === parentFolderId) {
      expect(documentPathItem.id).toBe(parentFolderId);
      expect(documentPathItem.rootFolderId).toBe(null);
    } else if (documentPathItem.id === folderId) {
      expect(documentPathItem.id).toBe(folderId);
      expect(documentPathItem.rootFolderId).toBe(parentFolderId);
    } else {
      throw new Error("unexpected document path item");
    }
  }
});

test("user should not be able to retrieve another user's folder", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  const query = gql`
    query documentPath($id: ID!) {
      documentPath(id: $id) {
        id
        parentFolderId
        rootFolderId
        workspaceId
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        { id: otherDocumentId },
        authorizationHeader
      ))()
  ).rejects.toThrow("Unauthorized");
});

test("retrieving a document that doesn't exist should throw an error", async () => {
  const authorizationHeader = { authorization: user1Data.sessionKey };
  const query = gql`
    query documentPath($id: ID!) {
      documentPath(id: $id) {
        id
        parentFolderId
        rootFolderId
        workspaceId
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        { id: "2bd63f0b-66f4-491c-8808-0a1de192cb67" },
        authorizationHeader
      ))()
  ).rejects.toThrowError(/FORBIDDEN/);
});

test("Unauthenticated", async () => {
  const authorizationHeader = { authorization: "badauthheader" };
  const query = gql`
    query documentPath($id: ID!) {
      documentPath(id: $id) {
        id
        parentFolderId
        rootFolderId
        workspaceId
      }
    }
  `;
  await expect(
    (async () =>
      await graphql.client.request(
        query,
        { id: otherDocumentId },
        authorizationHeader
      ))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});

describe("Input errors", () => {
  const query = gql`
    query documentPath($id: ID!) {
      documentPath(id: $id) {
        id
        parentFolderId
        rootFolderId
        workspaceId
      }
    }
  `;
  test("Invalid id", async () => {
    const user2Data = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { id: null },
          { authorizationHeader: user2Data.sessionKey }
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    const user2Data = await createUserWithWorkspace({
      id: uuidv4(),
      username: `${uuidv4()}@example.com`,
      password,
    });
    await expect(
      (async () =>
        await graphql.client.request(query, null, {
          authorizationHeader: user2Data.sessionKey,
        }))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
