import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import { registerUser } from "../../../../test/helpers/authentication/registerUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import { createInitialWorkspaceStructure } from "../../../../test/helpers/workspace/createInitialWorkspaceStructure";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
const username2 = "68776484-0e46-4027-a6f4-8bdeef185b73@example.com";
const password = "password";
let workspaceKey = "";
let workspaceKey2 = "";

const workspaceId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const otherWorkspaceId = "929ca262-f144-40f7-8fe2-d3147f415f26";
const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";
let initialWorkspaceStructureResult: any = null;
let workspace: any = null;

let sessionKey = "";
let sessionKey2 = "";

const setup = async () => {
  const registerUserResult = await registerUser(graphql, username, password);
  sessionKey = registerUserResult.sessionKey;
  const device = registerUserResult.mainDevice;
  const webDevice = registerUserResult.webDevice;
  initialWorkspaceStructureResult = await createInitialWorkspaceStructure({
    workspaceName: "workspace 1",
    workspaceId: workspaceId,
    deviceSigningPublicKey: device.signingPublicKey,
    deviceEncryptionPublicKey: device.encryptionPublicKey,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    webDevice,
    folderId: uuidv4(),
    folderIdSignature: `TODO+${uuidv4()}`,
    folderName: "Getting started",
    documentName: "Introduction",
    documentId: uuidv4(),
    graphql,
    authorizationHeader: sessionKey,
  });
  workspace =
    initialWorkspaceStructureResult.createInitialWorkspaceStructure.workspace;
  workspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: registerUserResult.mainDevice,
    deviceEncryptionPrivateKey: registerUserResult.encryptionPrivateKey,
    workspace,
  });

  const registerUserResult2 = await registerUser(graphql, username2, password);
  sessionKey2 = registerUserResult2.sessionKey;
  const device2 = registerUserResult2.mainDevice;
  const webDevice2 = registerUserResult2.webDevice;
  const initialWorkspaceStructureResult2 =
    await createInitialWorkspaceStructure({
      workspaceName: "other user workspace",
      workspaceId: otherWorkspaceId,
      deviceSigningPublicKey: device2.signingPublicKey,
      deviceEncryptionPublicKey: device2.encryptionPublicKey,
      deviceEncryptionPrivateKey: registerUserResult2.encryptionPrivateKey,
      webDevice: webDevice2,
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
  const createOtherFolderResult = await createFolder({
    graphql,
    name: "other folder",
    id: otherFolderId,
    parentKey: workspaceKey2,
    parentFolderId: null,
    authorizationHeader: sessionKey2,
    workspaceId: otherWorkspaceId,
    workspaceKeyId: workspace2.currentWorkspaceKey.id,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
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
  const parentFolderName = "parent folder";
  const createParentFolderResult = await createFolder({
    graphql,
    name: parentFolderName,
    id: parentFolderId,
    parentFolderId: null,
    parentKey: workspaceKey,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
    workspaceKeyId: workspace.currentWorkspaceKey.id,
  });
  const authorizationHeader = { authorization: sessionKey };

  const query = gql`
    {
        rootFolders(workspaceId: "${workspaceId}", first: 50) {
            edges {
                node {
                    id
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
  const folderName = "folder";
  const createFolderResult = await createFolder({
    graphql,
    name: folderName,
    id: folderId,
    parentFolderId: null,
    parentKey: workspaceKey,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
    workspaceKeyId: workspace.currentWorkspaceKey.id,
  });
  const query = gql`
    {
        rootFolders(workspaceId: "${workspaceId}", first: 50) {
            edges {
                node {
                    id
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
  const childFoldenName = "child folder";
  const createFolderResult = await createFolder({
    graphql,
    name: childFoldenName,
    id: childFolderId,
    parentFolderId: folderId,
    parentKey: workspaceKey,
    authorizationHeader: sessionKey,
    workspaceId: workspaceId,
    workspaceKeyId: workspace.currentWorkspaceKey.id,
  });
  const query = gql`
  {
      rootFolders(workspaceId: "${workspaceId}", first: 50) {
          edges {
              node {
                  id
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
      rootFolders(workspaceId: "${otherWorkspaceId}", first: 50) {
          edges {
              node {
                  id
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

describe("Input errors", () => {
  const authorizationHeader = { authorization: "badauthheader" };
  test("Invalid first", async () => {
    const query1 = gql`
    {
        rootFolders(workspaceId: "${otherWorkspaceId}", first: 51) {
            edges {
                node {
                    id
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
        await graphql.client.request(query1, null, authorizationHeader))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
  test("Invalid workspaceId", async () => {
    const query2 = gql`
      {
        rootFolders(workspaceId: "", first: 50) {
          edges {
            node {
              id
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
        await graphql.client.request(query2, null, authorizationHeader))()
    ).rejects.toThrowError(/BAD_USER_INPUT/);
  });
});
