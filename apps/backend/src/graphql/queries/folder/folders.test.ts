import { deriveSessionAuthorization, generateId } from "@serenity-tools/common";
import { gql } from "graphql-request";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getWorkspaceKeyForWorkspaceAndDevice } from "../../../../test/helpers/device/getWorkspaceKeyForWorkspaceAndDevice";
import { createFolder } from "../../../../test/helpers/folder/createFolder";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
let userData1: any = undefined;
let userData2: any = undefined;
const password = "password22room5K42";
let workspaceKey = "";
let workspaceKey2 = "";

const parentFolderId = "4e9a4c29-2295-471c-84b5-5bf55169ff8c";
const folderId1 = "3530b9ed-11f3-44c7-9e16-7dba1e14815f";
const folderId2 = "9e911f29-7a86-480b-89d7-5c647f21317f";
const childFolderId = "98b3f4d9-141a-4e11-a0f5-7437a6d1eb4b";
const otherFolderId = "c1c65251-7471-4893-a1b5-e3df937caf66";
let sessionKey = "";
let workspace: any = null;

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
  {
      folders(parentFolderId: "${parentFolderId}", first: 50, usingOldKeys: ${usingOldKeys}) {
          edges {
              node {
                  id
                  parentFolderId
                  rootFolderId
                  workspaceId
                  nameCiphertext
                  nameNonce
                  keyDerivationTrace {
                    workspaceKeyId
                    trace {
                      entryId
                      subkeyId
                      parentId
                      context
                    }
                  }
              }
          }
          pageInfo {
              hasNextPage
              endCursor
          }
      }
  }`;
  const result = await graphql.client.request<any>(
    query,
    undefined,
    authorizationHeaders
  );
  return result;
};

const setup = async () => {
  userData1 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  sessionKey = userData1.sessionKey;
  workspace = userData1.workspace;
  workspaceKey = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData1.device,
    deviceEncryptionPrivateKey: userData1.encryptionPrivateKey,
    workspace,
  });
  const parentFolderName = "parent folder";
  const createParentFolderResult = await createFolder({
    graphql,
    id: parentFolderId,
    name: parentFolderName,
    parentFolderId: null,
    parentKey: workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: workspace.currentWorkspaceKey.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    userId: userData1.user.id,
    device: userData1.webDevice,
  });

  userData2 = await createUserWithWorkspace({
    username: `${generateId()}@example.com`,
    password,
  });
  workspaceKey2 = getWorkspaceKeyForWorkspaceAndDevice({
    device: userData2.device,
    deviceEncryptionPrivateKey: userData2.encryptionPrivateKey,
    workspace: userData2.workspace,
  });
  const otherFolderName = "other folder";
  const createOtherFolderResult = await createFolder({
    graphql,
    id: otherFolderId,
    name: otherFolderName,
    parentFolderId: null,
    parentKey: workspaceKey2,
    workspaceId: userData2.workspace.id,
    workspaceKeyId: userData2.workspace.currentWorkspaceKey.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData2.sessionKey,
    }).authorization,
    userId: userData2.user.id,
    device: userData2.webDevice,
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
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  expect(result.folders.edges.length).toBe(0);
});

test("user should be able to list folders in a workspace with one item", async () => {
  const createParentFolderResult = await createFolder({
    graphql,
    id: folderId1,
    name: "parent folder",
    parentFolderId: parentFolderId,
    parentKey: workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    userId: userData1.user.id,
    device: userData1.webDevice,
  });
  const result = await getFolders({
    parentFolderId,
    usingOldKeys: false,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
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
    parentKey: workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    userId: userData1.user.id,
    device: userData1.webDevice,
  });
  const result = await getFolders({
    parentFolderId,
    usingOldKeys: false,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
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
    parentKey: workspaceKey,
    workspaceId: userData1.workspace.id,
    workspaceKeyId: userData1.workspace.currentWorkspaceKey.id,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
    userId: userData1.user.id,
    device: userData1.webDevice,
  });
  const result = await getFolders({
    parentFolderId,
    usingOldKeys: false,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
  });
  expect(result.folders.edges.length).toBe(2);
});

test("old workpace keys", async () => {
  const result = await getFolders({
    parentFolderId,
    usingOldKeys: true,
    authorizationHeader: deriveSessionAuthorization({
      sessionKey: userData1.sessionKey,
    }).authorization,
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
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
      }))()
  ).rejects.toThrow("Unauthorized");
});

test("listing folders that the user doesn't own throws an error", async () => {
  await expect(
    (async () =>
      await getFolders({
        parentFolderId: otherFolderId,
        usingOldKeys: false,
        authorizationHeader: deriveSessionAuthorization({
          sessionKey: userData1.sessionKey,
        }).authorization,
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
