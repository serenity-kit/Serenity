import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "68776484-0e46-4027-a6f4-8bdeef185b73@example.com";
const password = "password";
let sessionKey = "";
let sessionKey2 = "";
let workspaceKey = "";
let workspaceKey2 = "";

const workspaceId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const otherWorkspaceId = "929ca262-f144-40f7-8fe2-d3147f415f26";
const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";

const parentDocumentId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const documentId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const otherDocumentId = "929ca262-f144-40f7-8fe2-d3147f415f26";

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  sessionKey = registerUserResult.sessionKey;
  const device = registerUserResult.mainDevice;
  const initialWorkspaceStructureResult = await createInitialWorkspaceStructure(
    {
      workspaceName: "workspace 1",
      workspaceId: workspaceId,
      deviceSigningPublicKey: device.signingPublicKey,
      deviceEncryptionPublicKey: device.encryptionPublicKey,
      deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
      folderId: uuidv4(),
      folderIdSignature: `TODO+${uuidv4()}`,
      folderName: "Getting started",
      documentName: "Introduction",
      documentId: uuidv4(),
      graphql,
      authorizationHeader: sessionKey,
    }
  );
  const workspace =
    initialWorkspaceStructureResult.createInitialWorkspaceStructure.workspace;
  workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: registerUserResult.mainDevice,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    workspace,
  });
  const parentFolderName = "parent folder";
  const folderName = "folder";
  const childFolderName = "child folder";
  const createParentFolderResult = await createFolder({
    graphql,
    id: parentFolderId,
    name: parentFolderName,
    parentFolderId: null,
    parentKey: workspaceKey,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
    workspaceKeyId: workspace.currentWorkspaceKey.id,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: folderId,
    name: folderName,
    parentFolderId: null,
    parentKey: workspaceKey,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
    workspaceKeyId: workspace.currentWorkspaceKey.id,
  });
  const createChildFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: childFolderName,
    parentFolderId: null,
    parentKey: workspaceKey,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
    workspaceKeyId: workspace.currentWorkspaceKey.id,
  });
  await createDocument({
    graphql,
    id: parentDocumentId,
    parentFolderId: parentFolderId,
    workspaceId,
    contentSubkeyId: 1,
    authorizationHeader: sessionKey,
  });
  await createDocument({
    graphql,
    id: documentId,
    parentFolderId: folderId,
    workspaceId,
    contentSubkeyId: 2,
    authorizationHeader: sessionKey,
  });

  const registerUserResult2 = await registerUser(graphql, username2, password);
  sessionKey2 = registerUserResult2.sessionKey;
  const device2 = registerUserResult2.mainDevice;
  const initialWorkspaceStructureResult2 =
    await createInitialWorkspaceStructure({
      workspaceName: "other user workspace",
      workspaceId: otherWorkspaceId,
      deviceSigningPublicKey: device2.signingPublicKey,
      deviceEncryptionPublicKey: device2.encryptionPublicKey,
      deviceEncryptionPrivateKey: registerUserResult2.encryptionPrivateKey,
      folderId: uuidv4(),
      folderIdSignature: `TODO+${uuidv4()}`,
      folderName: "Getting started",
      documentName: "Introduction",
      documentId: uuidv4(),
      graphql,
      authorizationHeader: sessionKey2,
    });

  const workspace2 =
    initialWorkspaceStructureResult2.createInitialWorkspaceStructure.workspace;
  workspaceKey2 = await getWorkspaceKeyForWorkspaceAndDevice({
    device: registerUserResult2.mainDevice,
    deviceEncryptionPrivateKey: registerUserResult2.encryptionPrivateKey,
    workspace: workspace2,
  });
  const otherFolderName = "other folder";
  const createOtherFolderResult = await createFolder({
    graphql,
    id: otherFolderId,
    name: otherFolderName,
    parentFolderId: null,
    parentKey: workspaceKey2,
    authorizationHeader: sessionKey2,
    workspaceId: otherWorkspaceId,
    workspaceKeyId: workspace2.currentWorkspaceKey.id,
  });
  await createDocument({
    graphql,
    id: otherDocumentId,
    parentFolderId: otherFolderId,
    workspaceId: otherWorkspaceId,
    contentSubkeyId: 3,
    authorizationHeader: sessionKey2,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to get a document path", async () => {
  const authorizationHeader = { authorization: sessionKey };
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
  const result = await graphql.client.request(
    query,
    { id: parentDocumentId },
    authorizationHeader
  );
  expect(result.documentPath).toMatchInlineSnapshot(`
    [
      {
        "id": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
        "parentFolderId": null,
        "rootFolderId": null,
        "workspaceId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
      },
    ]
  `);
});

test("user should be able to get a document path for a deep tree", async () => {
  const authorizationHeader = { authorization: sessionKey };
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
  const result = await graphql.client.request(
    query,
    { id: documentId },
    authorizationHeader
  );
  expect(result.documentPath).toMatchInlineSnapshot(`
    [
      {
        "id": "3530b9ed-11f3-44c7-9e16-7dba1e14815f",
        "parentFolderId": null,
        "rootFolderId": null,
        "workspaceId": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
      },
    ]
  `);
});

test("user should not be able to retrieve another user's folder", async () => {
  const authorizationHeader = { authorization: sessionKey };
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
  const authorizationHeader = { authorization: sessionKey };
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
  const authorizationHeader = { authorization: sessionKey };
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
    await expect(
      (async () =>
        await graphql.client.request(
          query,
          { id: null },
          authorizationHeader
        ))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("No input", async () => {
    await expect(
      (async () =>
        await graphql.client.request(query, null, authorizationHeader))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
