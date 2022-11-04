import { gql } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const password = "password";
let user1Data: any = undefined;
let user2Data: any = undefined;
let user1WorkspaceKey = "";
let user2WorkspaceKey = "";

const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId1 = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const folderId2 = "9e911f29-7a86-480b-89d7-5c647f21317f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";

type GetFoldersProps = {
  parentFolderId: string;
  usingOldKeys: boolean;
  authorizationHeader: string;
};
const getFolders = async ({
  parentFolderId,
  usingOldKeys,
  authorizationHeader,
}: GetFoldersProps) => {
  const authorizationHeaders = { authorization: authorizationHeader };
  const query = gql`
    query folders($parentFolderId: ID!, $first: Int!, $usingOldKeys: Boolean) {
      folders(
        parentFolderId: $parentFolderId
        first: $first
        usingOldKeys: $usingOldKeys
      ) {
        edges {
          node {
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
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
  const result = await graphql.client.request(
    query,
    {
      parentFolderId,
      first: 50,
      usingOldKeys,
    },
    authorizationHeaders
  );
  return result;
};

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
  const parentFolderName = "parent folder";
  const createParentFolderResult = await createFolder({
    graphql,
    id: parentFolderId,
    name: parentFolderName,
    parentFolderId: null,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });
  user2Data = await createUserWithWorkspace({
    id: uuidv4(),
    username: `${uuidv4()}@example.com`,
    password,
  });
  user2WorkspaceKey = await getWorkspaceKeyForWorkspaceAndDevice({
    device: user2Data.device,
    deviceEncryptionPrivateKey: user2Data.encryptionPrivateKey,
    workspace: user2Data.workspace,
  });
  const otherFolderName = "other folder";
  const createOtherFolderResult = await createFolder({
    graphql,
    id: otherFolderId,
    name: otherFolderName,
    parentFolderId: null,
    parentKey: user2WorkspaceKey,
    authorizationHeader: user2Data.sessionKey,
    workspaceId: user2Data.workspace.id,
    workspaceKeyId: user2Data.workspace.currentWorkspaceKey.id,
  });
};

beforeAll(async () => {
  await deleteAllRecords();
  await setup();
});

test("user should be able to list folders in a workspace when no subfoldes", async () => {
  const result = await getFolders({
    parentFolderId,
    usingOldKeys: false,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.folders.edges.length).toBe(0);
});

test("user should be able to list folders in a workspace with one item", async () => {
  const createParentFolderResult = await createFolder({
    graphql,
    id: folderId1,
    name: "parent folder",
    parentFolderId: parentFolderId,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });
  const result = await getFolders({
    parentFolderId,
    usingOldKeys: false,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.folders.edges.length).toBe(1);
  result.folders.edges.forEach(
    (folder: {
      node: { id: string; name: any; parentFolderId: any; rootFolderId: any };
    }) => {
      if (folder.node.id === folderId1) {
        expect(folder.node.parentFolderId).toBe(parentFolderId);
        expect(folder.node.rootFolderId).toBe(parentFolderId);
      }
    }
  );
});

test("user should be able to list folders in a workspace with multiple items", async () => {
  const createFolderResult = await createFolder({
    graphql,
    id: folderId2,
    name: "multiple folders",
    parentFolderId: parentFolderId,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });
  const result = await getFolders({
    parentFolderId,
    usingOldKeys: false,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.folders.edges.length).toBe(2);
  result.folders.edges.forEach(
    (folder: {
      node: { id: string; name: any; parentFolderId: any; rootFolderId: any };
    }) => {
      if (folder.node.id === folderId2) {
        expect(folder.node.parentFolderId).toBe(parentFolderId);
        expect(folder.node.rootFolderId).toBe(parentFolderId);
      }
    }
  );
});

test("user should be able to list without showing subfolders", async () => {
  const createFolderResult = await createFolder({
    graphql,
    id: childFolderId,
    name: "folder",
    parentFolderId: folderId1,
    parentKey: user1WorkspaceKey,
    authorizationHeader: user1Data.sessionKey,
    workspaceId: user1Data.workspace.id,
    workspaceKeyId: user1Data.workspace.currentWorkspaceKey.id,
  });
  const result = await getFolders({
    parentFolderId,
    usingOldKeys: false,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.folders.edges.length).toBe(2);
});

test("old workpace keys", async () => {
  const result = await getFolders({
    parentFolderId,
    usingOldKeys: true,
    authorizationHeader: user1Data.sessionKey,
  });
  expect(result.folders.edges.length).toBe(0);
});

test("retrieving a folder that doesn't exist throws an error", async () => {
  const fakeFolderId = "2bd63f0b-66f4-491c-8808-0a1de192cb67";
  await expect(
    (async () =>
      await getFolders({
        parentFolderId: fakeFolderId,
        usingOldKeys: false,
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("listing folders that the user doesn't own throws an error", async () => {
  await expect(
    (async () =>
      await getFolders({
        parentFolderId: otherFolderId,
        usingOldKeys: false,
        authorizationHeader: user1Data.sessionKey,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getFolders({
        parentFolderId,
        usingOldKeys: false,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
