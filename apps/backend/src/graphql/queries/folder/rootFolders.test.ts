import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { v4 as uuidv4 } from "uuid";

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

let sessionKey = "";
let sessionKey2 = "";

beforeEach(async () => {
  // TODO: we don't want this before every test
  if (!didRegisterUser) {
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
    didRegisterUser = true;

    const registerUserResult2 = await registerUser(
      graphql,
      username2,
      password
    );
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
      name: null,
      id: otherFolderId,
      parentFolderId: null,
      authorizationHeader: sessionKey2,
      workspaceId: otherWorkspaceId,
    });
  }
});

test("user should be able to list folders in a workspace when preloaded with initial workspace", async () => {
  const authorizationHeader = { authorization: sessionKey };
  // get root folders from graphql
  const query = gql`
    {
        rootFolders(workspaceId: "${workspaceId}", first: 50) {
            edges {
                node {
                    id
                    name
                    parentFolderId
                    rootFolderId
                    workspaceId
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
    `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.rootFolders.edges.length).toBe(1);
});

test("user should be able to list folders in a workspace with one item", async () => {
  const createParentFolderResult = await createFolder({
    graphql,
    name: null,
    id: parentFolderId,
    parentFolderId: null,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
  });
  const authorizationHeader = { authorization: sessionKey };

  const query = gql`
    {
        rootFolders(workspaceId: "${workspaceId}", first: 50) {
            edges {
                node {
                    id
                    name
                    parentFolderId
                    rootFolderId
                    workspaceId
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
    `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.rootFolders.edges.length).toBe(2);
  result.rootFolders.edges.forEach(
    (edge: { node: { workspaceId: any; parentFolderId: any } }) => {
      expect(edge.node.workspaceId).toBe(workspaceId);
      expect(edge.node.parentFolderId).toBe(null);
    }
  );
});

test("user should be able to list folders in a workspace with multiple items", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const createFolderResult = await createFolder({
    graphql,
    name: null,
    id: folderId,
    parentFolderId: null,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
  });
  const query = gql`
    {
        rootFolders(workspaceId: "${workspaceId}", first: 50) {
            edges {
                node {
                    id
                    name
                    parentFolderId
                    rootFolderId
                    workspaceId
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
    `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.rootFolders.edges.length).toBe(3);
  result.rootFolders.edges.forEach(
    (edge: { node: { workspaceId: any; parentFolderId: any } }) => {
      expect(edge.node.workspaceId).toBe(workspaceId);
      expect(edge.node.parentFolderId).toBe(null);
    }
  );
});

test("user should be able to list without showing subfolders", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const createFolderResult = await createFolder({
    graphql,
    name: null,
    id: childFolderId,
    parentFolderId: folderId,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
  });
  const query = gql`
  {
      rootFolders(workspaceId: "${workspaceId}", first: 50) {
          edges {
              node {
                  id
                  name
                  parentFolderId
                  rootFolderId
                  workspaceId
              }
          }
          pageInfo {
              hasNextPage
              endCursor
          }
      }
  }
  `;
  const result = await graphql.client.request(query, null, authorizationHeader);
  expect(result.rootFolders.edges.length).toBe(3);
});

test("retrieving a workspace that doesn't exist throws an error", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const fakeWorkspaceId = "2bd63f0b-66f4-491c-8808-0a1de192cb67";
  const query = gql`
  {
      rootFolders(workspaceId: "${fakeWorkspaceId}", first: 50) {
          edges {
              node {
                  id
                  name
                  parentFolderId
                  rootFolderId
                  workspaceId
              }
          }
          pageInfo {
              hasNextPage
              endCursor
          }
      }
  }
  `;
  await expect(
    (async () =>
      await graphql.client.request(query, null, authorizationHeader))()
  ).rejects.toThrow("Unauthorized");
});

test("listing folders that the user doesn't own throws an error", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const query = gql`
  {
      rootFolders(workspaceId: "${otherWorkspaceId}", first: 50) {
          edges {
              node {
                  id
                  name
                  parentFolderId
                  rootFolderId
                  workspaceId
              }
          }
          pageInfo {
              hasNextPage
              endCursor
          }
      }
  }
  `;
  await expect(
    (async () =>
      await graphql.client.request(query, null, authorizationHeader))()
  ).rejects.toThrow("Unauthorized");
});
