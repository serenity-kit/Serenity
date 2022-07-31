import { gql } from "graphql-request";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import { v4 as uuidv4 } from "uuid";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "68776484-0e46-4027-a6f4-8bdeef185b73@example.com";
const password = "password";

const workspaceId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const otherWorkspaceId = "929ca262-f144-40f7-8fe2-d3147f415f26";
const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId1 = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const folderId2 = "9e911f29-7a86-480b-89d7-5c647f21317f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";
let sessionKey = "";

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  sessionKey = registerUserResult.sessionKey;

  await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: workspaceId,
    folderId: uuidv4(),
    folderName: "Getting started",
    folderIdSignature: `TODO+${uuidv4()}`,
    documentId: uuidv4(),
    documentName: "Introduction",
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
  const registerUserResult2 = await registerUser(graphql, username2, password);
  await createInitialWorkspaceStructure({
    workspaceName: "other user workspace",
    workspaceId: otherWorkspaceId,
    folderId: uuidv4(),
    folderName: "Getting started",
    folderIdSignature: `TODO+${uuidv4()}`,
    documentId: uuidv4(),
    documentName: "Introduction",
    graphql,
    authorizationHeader: registerUserResult2.sessionKey,
  });
  const createOtherFolderResult = await createFolder({
    graphql,
    id: otherFolderId,
    name: null,
    parentFolderId: null,
    authorizationHeader: registerUserResult2.sessionKey,
    workspaceId: otherWorkspaceId,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to list folders in a workspace when no subfoldes", async () => {
  const authorizationHeader = { authorization: sessionKey };
  // get root folders from graphql
  const query = gql`
    {
        folders(parentFolderId: "${parentFolderId}", first: 50) {
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
  expect(result.folders.edges.length).toBe(0);
});

test("user should be able to list folders in a workspace with one item", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const createParentFolderResult = await createFolder({
    graphql,
    id: folderId1,
    name: null,
    parentFolderId: parentFolderId,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
  });
  const query = gql`
    {
        folders(parentFolderId: "${parentFolderId}", first: 50) {
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
  expect(result.folders.edges.length).toBe(1);
  result.folders.edges.forEach(
    (folder: {
      node: { id: string; name: any; parentFolderId: any; rootFolderId: any };
    }) => {
      if (folder.node.id === folderId1) {
        expect(folder.node.name).toBe("Untitled");
        expect(folder.node.parentFolderId).toBe(parentFolderId);
        expect(folder.node.rootFolderId).toBe(parentFolderId);
      }
    }
  );
});

test("user should be able to list folders in a workspace with multiple items", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const createFolderResult = await createFolder({
    graphql,
    id: folderId2,
    name: null,
    parentFolderId: parentFolderId,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
  });
  const query = gql`
    {
        folders(parentFolderId: "${parentFolderId}", first: 50) {
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
  expect(result.folders.edges.length).toBe(2);
  result.folders.edges.forEach(
    (folder: {
      node: { id: string; name: any; parentFolderId: any; rootFolderId: any };
    }) => {
      if (folder.node.id === folderId2) {
        expect(folder.node.name).toBe("Untitled");
        expect(folder.node.parentFolderId).toBe(parentFolderId);
        expect(folder.node.rootFolderId).toBe(parentFolderId);
      }
    }
  );
});

test("user should be able to list without showing subfolders", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const createFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: null,
    parentFolderId: folderId1,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
  });
  const query = gql`
  {
      folders(parentFolderId: "${parentFolderId}", first: 50) {
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
  expect(result.folders.edges.length).toBe(2);
});

test("retrieving a folder that doesn't exist throws an error", async () => {
  const authorizationHeader = { authorization: sessionKey };
  const fakeFolderId = "2bd63f0b-66f4-491c-8808-0a1de192cb67";
  const query = gql`
  {
      folders(parentFolderId: "${fakeFolderId}", first: 50) {
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
      folders(parentFolderId: "${otherFolderId}", first: 50) {
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

test("Unauthenticated", async () => {
  const authorizationHeader = { authorization: "badauthheader" };
  const query = gql`
  {
      folders(parentFolderId: "${otherFolderId}", first: 50) {
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
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
