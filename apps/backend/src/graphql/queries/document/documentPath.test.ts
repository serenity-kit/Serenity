import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { createDocument } from "../../../../test/helpers/document/createDocument";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "68776484-0e46-4027-a6f4-8bdeef185b73@example.com";
const password = "password";
let didRegisterUser = false;

beforeAll(async () => {
  await deleteAllRecords();
});

const workspaceId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const otherWorkspaceId = "929ca262-f144-40f7-8fe2-d3147f415f26";
const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";

const parentDocumentId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const documentId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const otherDocumentId = "929ca262-f144-40f7-8fe2-d3147f415f26";

beforeEach(async () => {
  // TODO: we don't want this before every test
  if (!didRegisterUser) {
    await registerUser(graphql, username, password);
    await createWorkspace({
      name: "workspace 1",
      id: workspaceId,
      graphql,
      authorizationHeader: `TODO+${username}`,
    });
    const createParentFolderResult = await createFolder({
      graphql,
      id: parentFolderId,
      name: null,
      parentFolderId: null,
      authorizationHeader: `TODO+${username}`,
      workspaceId: workspaceId,
    });
    const createFolderResult = await createFolder({
      graphql,
      id: folderId,
      name: null,
      parentFolderId: null,
      authorizationHeader: `TODO+${username}`,
      workspaceId: workspaceId,
    });
    const createChildFolderResult = await createFolder({
      graphql,
      id: childFolderId,
      name: null,
      parentFolderId: null,
      authorizationHeader: `TODO+${username}`,
      workspaceId: workspaceId,
    });
    await createDocument({
      graphql,
      id: parentDocumentId,
      parentFolderId: parentFolderId,
      workspaceId,
      authorizationHeader: `TODO+${username}`,
    });
    await createDocument({
      graphql,
      id: documentId,
      parentFolderId: folderId,
      workspaceId,
      authorizationHeader: `TODO+${username}`,
    });
    didRegisterUser = true;

    await registerUser(graphql, username2, password);
    await createWorkspace({
      name: "other user workspace",
      id: otherWorkspaceId,
      graphql,
      authorizationHeader: `TODO+${username2}`,
    });
    const createOtherFolderResult = await createFolder({
      graphql,
      id: otherFolderId,
      name: null,
      parentFolderId: null,
      authorizationHeader: `TODO+${username2}`,
      workspaceId: otherWorkspaceId,
    });
    await createDocument({
      graphql,
      id: otherDocumentId,
      parentFolderId: otherFolderId,
      workspaceId: otherWorkspaceId,
      authorizationHeader: `TODO+${username2}`,
    });
  }
});

test("user should be able to get a document path", async () => {
  const authorizationHeader = { authorization: `TODO+${username}` };
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
  const authorizationHeader = { authorization: `TODO+${username}` };
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
  const authorizationHeader = { authorization: `TODO+${username}` };
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
  const authorizationHeader = { authorization: `TODO+${username}` };
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
