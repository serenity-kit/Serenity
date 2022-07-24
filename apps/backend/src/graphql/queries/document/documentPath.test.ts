import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { createDocument } from "../../../../test/helpers/document/createDocument";
import { v4 as uuidv4 } from "uuid";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "68776484-0e46-4027-a6f4-8bdeef185b73@example.com";
const password = "password";
let sessionKey = "";
let sessionKey2 = "";

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

  await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: workspaceId,
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
  const createParentFolderResult = await createFolder({
    graphql,
    id: parentFolderId,
    name: null,
    parentFolderId: null,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
  });
  const createFolderResult = await createFolder({
    graphql,
    id: folderId,
    name: null,
    parentFolderId: null,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
  });
  const createChildFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: null,
    parentFolderId: null,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
  });
  await createDocument({
    graphql,
    id: parentDocumentId,
    parentFolderId: parentFolderId,
    workspaceId,
    authorizationHeader: sessionKey,
  });
  await createDocument({
    graphql,
    id: documentId,
    parentFolderId: folderId,
    workspaceId,
    authorizationHeader: sessionKey,
  });

  const registerUserResult2 = await registerUser(graphql, username2, password);
  sessionKey2 = registerUserResult2.sessionKey;

  await createInitialWorkspaceStructure({
    workspaceName: "other user workspace",
    workspaceId: otherWorkspaceId,
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey2,
  });
  const createOtherFolderResult = await createFolder({
    graphql,
    id: otherFolderId,
    name: null,
    parentFolderId: null,
    authorizationHeader: sessionKey2,
    workspaceId: otherWorkspaceId,
  });
  await createDocument({
    graphql,
    id: otherDocumentId,
    parentFolderId: otherFolderId,
    workspaceId: otherWorkspaceId,
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
        name
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
    Array [
      Object {
        "id": "4e9a4c29-2295-471c-84b5-5bf55169ff8c",
        "name": "Untitled",
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
        name
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
    Array [
      Object {
        "id": "3530b9ed-11f3-44c7-9e16-7dba1e14815f",
        "name": "Untitled",
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
        name
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
        name
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
  ).rejects.toThrow("Document not found");
});

test("Unauthenticated", async () => {
  const authorizationHeader = { authorization: "badauthheader" };
  const query = gql`
    query documentPath($id: ID!) {
      documentPath(id: $id) {
        id
        name
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
        name
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
